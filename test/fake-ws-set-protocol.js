/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 16.06.17
 */

import { JsonSerializer } from './../src/serializers/JsonSerializer';

const TIMEOUT = 15,

    root = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]') ?
        global : window;

let protocol = 'json',

    WebSocket = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;

        this.encoder = new JsonSerializer();
        this.encode = this.encoder.encode;
        this.decode = this.encoder.decode;

        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;

        this.protocol = '';

        this.readyState = 1;    // Closed

        root.setTimeout(() => {
            this.protocol = 'wamp.2.' + protocol;
            this.onopen();
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

