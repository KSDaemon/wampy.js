import { isNode } from './constants.js';

function isWebSocketSchemeSpecified (url) {
    return /^ws(s)?:\/\//.test(url);
}

function getServerUrlForNode (url) {
    return isWebSocketSchemeSpecified(url) ? url : null;
}

function getServerUrlForBrowser (url) {
    if (isWebSocketSchemeSpecified(url)) {
        return url;
    }

    const isSecureProtocol = window.location.protocol === 'https:';
    const scheme = isSecureProtocol ? 'wss://' : 'ws://';
    const port = window.location.port ? `:${window.location.port}` : '';

    if (!url) {
        return `${scheme}${window.location.hostname}${port}/ws`;
    }

    if (url.startsWith('/')) {    // just path on current server
        return `${scheme}${window.location.hostname}${port}${url}`;
    }

    // assuming just domain + path
    return `${scheme}${url}`;
}

/** Get a WebSocket object from the browsers's "window" global variable
 *
 * @param {string} parsedUrl The server URL
 * @param {string[]} protocols The WebSocket protocols
 *
 * @returns {Object} a WebSocket Object, or null if none is found
 */
function getWebSocketFromWindowObject (parsedUrl, protocols) {
    if (window?.WebSocket) { // Chrome, MSIE, newer Firefox
        return new window.WebSocket(parsedUrl, protocols);
    } else if (window?.MozWebSocket) { // older versions of Firefox
        return new window.MozWebSocket(parsedUrl, protocols);
    }

    return null;
}

/** Get a WebSocket object according to the user's current environment
 *
 * @param {Object} wampy an optional wampy instance
 * @param {string} wampy._url The WebSocket URL
 * @param {Object} wampy._options An options hash-table.
 * @param {string[]} wampy._protocols The WebSocket protocols
 * @param {boolean} wampy.isBrowserMock a flag indicating if the
 * function is being called from a simulated browser environment
 * (such as NodeJS tests that use jsdom).
 *
 * @returns {Object} a WebSocket Object, or null if none is found
 */
export function getWebSocket (wampy = {}) {
    const { url, protocols, options, isBrowserMock } = wampy;
    const { ws, additionalHeaders, wsRequestOptions } = options || {};
    const isActualNode = isNode && !isBrowserMock;

    if (!ws && isActualNode) {
        return null;
    }

    const parsedUrl = isActualNode ? getServerUrlForNode(url) : getServerUrlForBrowser(url);

    if (!parsedUrl) {
        return null;
    }

    if (ws) { // User provided webSocket class
        return new ws(parsedUrl, protocols, null, additionalHeaders, wsRequestOptions);
    }

    return getWebSocketFromWindowObject(parsedUrl, protocols);
}

export function getNewPromise () {
    const promise = {};

    promise.promise = new Promise(function (resolve, reject) {
        promise.onSuccess = resolve;
        promise.onError = reject;
    });

    return promise;
}
