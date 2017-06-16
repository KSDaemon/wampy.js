/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 16.06.17
 */

const TIMEOUT = 15,

    root = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]') ?
        global : window;

let protocol = 'json',
    openTimer = null,

    WebSocket = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;

        this.encoder = JSON;
        this.encode = this.encoder.stringify;
        this.decode = this.encoder.parse;

        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;

        this.protocol = '';

        this.readyState = 1;    // Closed

        let self = this;

        openTimer = root.setTimeout(function () {
            self.protocol = 'wamp.2.' + protocol;
            self.onopen();
        }, TIMEOUT);

    },

    setProtocol = function (proto) {
        protocol = proto;
    };

WebSocket.prototype.close = function (code, reason) {
    this.readyState = 3;    // Closed
    this.onclose();
};

WebSocket.prototype.abort = function () {
    this.readyState = 3;    // Closed
    this.onerror();
};

WebSocket.prototype.send = function (data) { };

export { WebSocket, setProtocol };

