import { isNode } from "./constants";

function getServerUrlBrowser(url: string) {
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

function getServerUrlNode(url: string) {
    if (/^ws(s)?:\/\//.test(url)) {
        // ws scheme is specified
        return url;
    } else {
        return null;
    }
}

export function getWebSocket(
    url: string,
    protocols: string | string[],
    ws: new (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any) => any,
    headers: any,
    requestOptions: any
) {
    const parsedUrl = isNode ? getServerUrlNode(url) : getServerUrlBrowser(url);

    if (!parsedUrl) {
        return null;
    }

    if (ws) {
        // User provided webSocket class
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
