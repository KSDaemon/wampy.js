import { isNode } from './constants.js';

function isWebSocketSchemeSpecified (url) {
    return /^ws(s)?:\/\//.test(url);
}

export function getServerUrlForNode (url) {
    return isWebSocketSchemeSpecified(url) ? url : null;
}

export function getServerUrlForBrowser (url) {
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

export function getWebSocket (options = {}) {
    const { url, protocols, ws, headers, requestOptions, isBrowserMock } = options;
    const parsedUrl = (isNode && !isBrowserMock) ? getServerUrlForNode(url) : getServerUrlForBrowser(url);

    if (!parsedUrl) {
        return null;
    }

    if (ws) {   // User provided webSocket class
        return new ws(parsedUrl, protocols, null, headers, requestOptions);
    } else if (isNode && !isBrowserMock) { // we're in node, but no webSocket class was provided
        return null;
    } else if (window?.WebSocket) { // Chrome, MSIE, newer Firefox
        return new window.WebSocket(parsedUrl, protocols);
    } else if (window?.MozWebSocket) { // older versions of Firefox
        return new window.MozWebSocket(parsedUrl, protocols);
    }

    return null;
}

export function getNewPromise () {
    const promise = {};

    promise.promise = new Promise(function (resolve, reject) {
        promise.onSuccess = resolve;
        promise.onError = reject;
    });

    return promise;
}
