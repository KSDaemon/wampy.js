import { isNode } from "./constants";

/**
 * Gets the server url from the browser
 * @param url Full url to parse
 * @returns
 */
function getServerUrlBrowser(url: string): string {
    let scheme: string, port: string;

    if (/^ws(s)?:\/\//.test(url)) {
        // ws scheme is specified
        return url;
    }

    scheme = window.location.protocol === "https:" ? "wss://" : "ws://";

    if (!url) {
        port = window.location.port !== "" ? ":" + window.location.port : "";
        return scheme + window.location.hostname + port + "/ws";
    } else if (url[0] === "/") {
        // just path on current server
        port = window.location.port !== "" ? ":" + window.location.port : "";
        return scheme + window.location.hostname + port + url;
    } else {
        // assuming just domain+path
        return scheme + url;
    }
}

/**
 * Gets the server url from node
 * @param url The url to parse
 * @returns
 */
function getServerUrlNode(url: string): string | null {
    if (/^ws(s)?:\/\//.test(url)) {
        // ws scheme is specified
        return url;
    } else {
        return null;
    }
}

/**
 *
 * @param url Url for the websocket
 * @param protocols Protocols for the websocket
 * @param ws Websock
 * @param headers
 * @param requestOptions
 * @returns
 */
export function getWebSocket(
    url: string,
    protocols: string | string[],
    ws?: typeof WebSocket | null,
    headers?: unknown,
    requestOptions?: unknown
) {
    const parsedUrl = isNode ? getServerUrlNode(url) : getServerUrlBrowser(url);

    if (!parsedUrl) {
        return null;
    }

    if (ws) {
        // User provided webSocket class
        // @ts-ignore
        return new ws(parsedUrl, protocols, null, headers, requestOptions);
    } else if (isNode) {
        // we're in node, but no webSocket provided
        return null;
    } else if ("WebSocket" in window) {
        // Chrome, MSIE, newer Firefox
        return new window.WebSocket(parsedUrl, protocols);
    } else if ("MozWebSocket" in window) {
        // older versions of Firefox
        // @ts-ignore
        return new window.MozWebSocket(parsedUrl, protocols);
    }

    return null;
}
