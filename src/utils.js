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

    const isSecureProtocol = globalThis.location.protocol === 'https:';
    const scheme = isSecureProtocol ? 'wss://' : 'ws://';
    const port = globalThis.location.port ? `:${globalThis.location.port}` : '';

    if (!url) {
        return `${scheme}${globalThis.location.hostname}${port}/ws`;
    }

    if (url.startsWith('/')) {    // just path on current server
        return `${scheme}${globalThis.location.hostname}${port}${url}`;
    }

    // assuming just domain + path
    return `${scheme}${url}`;
}

/** Get a WebSocket object from the browsers's window global variable
 *
 * @param {string} parsedUrl The server URL
 * @param {string[]} protocols The WebSocket protocols
 *
 * @returns {Object} A WebSocket Object, or null if none is found
 */
function getWebSocketFromWindowObject (parsedUrl, protocols) {
    if (globalThis?.WebSocket) { // Chrome, MSIE, newer Firefox
        return new globalThis.WebSocket(parsedUrl, protocols);
    } else if (globalThis?.MozWebSocket) { // older versions of Firefox
        return new globalThis.MozWebSocket(parsedUrl, protocols);
    }

    return null;
}

/** Get a WebSocket object according to the user's current environment
 *
 * @param {Object} configObject A configuration object containing multiple properties
 * @param {string} configObject.url The WebSocket URL
 * @param {string[]} configObject.protocols The WebSocket protocols
 * @param {Object} configObject.options An options hash-table
 * @param {WebSocket} configObject.options.ws A user-provided WebSocket class
 * @param {Object} configObject.options.additionalHeaders User provided extra HTTP headers for Node.js
 * @param {Object} configObject.options.wsRequestOptions User provided WS Client Config Options for Node.js
 * @param {boolean} configObject.isBrowserMock A flag indicating if the environment is a simulated browser
 * environment inside Node.js, such as jsdom.
 *
 * @returns {Object} a WebSocket Object, or null if none is found
 */
export function getWebSocket ({ url, protocols, options, isBrowserMock } = {}) {
    const { ws, additionalHeaders, wsRequestOptions } = options || {};
    const isActualNode = isNode && !isBrowserMock;

    if (!ws && isActualNode) {
        return null;
    }

    const parsedUrl = isActualNode ? getServerUrlForNode(url) : getServerUrlForBrowser(url);

    if (!parsedUrl) {
        return null;
    }

    if (ws) {    // User-provided WebSocket class
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
