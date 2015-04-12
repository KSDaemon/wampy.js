/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

;(typeof define === 'function' ? function (m) { define('Wampy', m); } :
    typeof exports === 'object' ? function (m) { module.exports = m(); } :
    function (m) { this.Wampy = m(); }
)(function () {

    var WebSocket = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;
        this.binaryType = 'arraybuffer';

        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;

        this.protocol = '';

        this.readyState = 3;    // Closed

    };

    WebSocket.prototype.close = function (code, reason) {

    };

    WebSocket.prototype.send = function (data) {

    };

    return WebSocket;

});
