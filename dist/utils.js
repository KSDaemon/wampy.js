'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getWebSocket = getWebSocket;
exports.isBinaryTypeAllowed = isBinaryTypeAllowed;

var _constants = require('./constants');

function getServerUrlBrowser(url) {
    var scheme = void 0,
        port = void 0;

    if (/^ws(s)?:\/\//.test(url)) {
        // ws scheme is specified
        return url;
    }

    scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

    if (!url) {
        port = window.location.port !== '' ? ':' + window.location.port : '';
        return scheme + window.location.hostname + port + '/ws';
    } else if (url[0] === '/') {
        // just path on current server
        port = window.location.port !== '' ? ':' + window.location.port : '';
        return scheme + window.location.hostname + port + url;
    } else {
        // assuming just domain+path
        return scheme + url;
    }
}

function getServerUrlNode(url) {
    if (/^ws(s)?:\/\//.test(url)) {
        // ws scheme is specified
        return url;
    } else {
        return null;
    }
}

function getWebSocket(url, protocols, ws) {
    var parsedUrl = _constants.isNode ? getServerUrlNode(url) : getServerUrlBrowser(url);

    if (!parsedUrl) {
        return null;
    }

    if (ws) {
        // User provided webSocket class
        return new ws(parsedUrl, protocols);
    } else if (_constants.isNode) {
        // we're in node, but no webSocket provided
        return null;
    } else if ('WebSocket' in window) {
        // Chrome, MSIE, newer Firefox
        return new window.WebSocket(parsedUrl, protocols);
    } else if ('MozWebSocket' in window) {
        // older versions of Firefox
        return new window.MozWebSocket(parsedUrl, protocols);
    }

    return null;
}

function isBinaryTypeAllowed(type) {
    return _constants.ALLOWED_BINARY_TYPES.indexOf(type) !== -1;
}
//# sourceMappingURL=utils.js.map
