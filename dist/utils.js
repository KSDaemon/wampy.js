"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebSocket = void 0;
var constants_1 = require("./constants");
/**
 * Gets the server url from the browser
 * @param url Full url to parse
 * @returns
 */
function getServerUrlBrowser(url) {
    var scheme, port;
    if (/^ws(s)?:\/\//.test(url)) {
        // ws scheme is specified
        return url;
    }
    scheme = window.location.protocol === "https:" ? "wss://" : "ws://";
    if (!url) {
        port = window.location.port !== "" ? ":" + window.location.port : "";
        return scheme + window.location.hostname + port + "/ws";
    }
    else if (url[0] === "/") {
        // just path on current server
        port = window.location.port !== "" ? ":" + window.location.port : "";
        return scheme + window.location.hostname + port + url;
    }
    else {
        // assuming just domain+path
        return scheme + url;
    }
}
/**
 * Gets the server url from node
 * @param url The url to parse
 * @returns
 */
function getServerUrlNode(url) {
    if (/^ws(s)?:\/\//.test(url)) {
        // ws scheme is specified
        return url;
    }
    else {
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
function getWebSocket(url, protocols, ws, headers, requestOptions) {
    var parsedUrl = constants_1.isNode ? getServerUrlNode(url) : getServerUrlBrowser(url);
    if (!parsedUrl) {
        return null;
    }
    if (ws) {
        // User provided webSocket class
        // @ts-ignore
        return new ws(parsedUrl, protocols, null, headers, requestOptions);
    }
    else if (constants_1.isNode) {
        // we're in node, but no webSocket provided
        return null;
    }
    else if ("WebSocket" in window) {
        // Chrome, MSIE, newer Firefox
        return new window.WebSocket(parsedUrl, protocols);
    }
    else if ("MozWebSocket" in window) {
        // older versions of Firefox
        // @ts-ignore
        return new window.MozWebSocket(parsedUrl, protocols);
    }
    return null;
}
exports.getWebSocket = getWebSocket;
//# sourceMappingURL=utils.js.map