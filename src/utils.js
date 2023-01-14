import { isNode } from './constants.js';

function isWebSocketSchemeSpecified (url) {
    return /^ws(s)?:\/\//.test(url);
}

function getServerUrlForNode (url) {
    return isWebSocketSchemeSpecified(url) ? url : null;
}

function getWebSocketForNode ({ _url, _protocols, _options }) {
    const parsedUrl = getServerUrlForNode(_url);

    if (!parsedUrl || !_options?.ws) {
        return null;
    }

    const { ws, additionalHeaders, wsRequestOptions } = _options;

    return new ws(_url, _protocols, null, additionalHeaders, wsRequestOptions);
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

    if (url.startsWith('/')) { // just path on current server
        return `${scheme}${window.location.hostname}${port}${url}`;
    }

    // assuming just domain + path
    return `${scheme}${url}`;
}

function getWebSocketForBrowser ({ _url, _protocols }) {
    const parsedUrl = getServerUrlForBrowser(_url);

    if (window?.WebSocket) { // Chrome, MSIE, newer Firefox
        return new window.WebSocket(parsedUrl, _protocols);
    }

    if (window?.MozWebSocket) { // older versions of Firefox
        return new window.MozWebSocket(parsedUrl, _protocols);
    }

    return null;
}

export function getWebSocket (wampy = {}) {
    if (isNode && !wampy?.isBrowserMock) {
        return getWebSocketForNode(wampy);
    }

    return getWebSocketForBrowser(wampy);
}

export function getNewPromise () {
    const promise = {};

    promise.promise = new Promise(function (resolve, reject) {
        promise.onSuccess = resolve;
        promise.onError = reject;
    });

    return promise;
}
