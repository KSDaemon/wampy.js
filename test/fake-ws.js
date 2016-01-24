/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

(typeof define === 'function' ? function (m) { define('Wampy', m); } :
    typeof exports === 'object' ? function (m) { module.exports = m(); } :
    function (m) { this.Wampy = m(); }
)(function () {

    var WAMP_MSG_SPEC = {
            HELLO: 1,
            WELCOME: 2,
            ABORT: 3,
            CHALLENGE: 4,
            AUTHENTICATE: 5,
            GOODBYE: 6,
            HEARTBEAT: 7,
            ERROR: 8,
            PUBLISH: 16,
            PUBLISHED: 17,
            SUBSCRIBE: 32,
            SUBSCRIBED: 33,
            UNSUBSCRIBE: 34,
            UNSUBSCRIBED: 35,
            EVENT: 36,
            CALL: 48,
            CANCEL: 49,
            RESULT: 50,
            REGISTER: 64,
            REGISTERED: 65,
            UNREGISTER: 66,
            UNREGISTERED: 67,
            INVOCATION: 68,
            INTERRUPT: 69,
            YIELD: 70
        },

        TIMEOUT = 5,

        sendData = require('./send-data'),

        receivedData = [
            [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
            [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
            [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
            [WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.error.goodbye_and_out'],
            [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
            [WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.error.goodbye_and_out'],
            [WAMP_MSG_SPEC.HELLO, 'AppRealm', {}],
            []
        ],

        root = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]') ?
            global : window,

        WebSocket = function (url, protocols) {
            this.url = url;
            this.protocols = protocols;
            this.transportEncoding = this.protocols[0].split('.')[2];

            if (this.transportEncoding === 'msgpack') {
                this.binaryType = 'arraybuffer';
                this.encoder = require('msgpack-lite');
                this.encode = this.encoder.encode;
                this.decode = this.encoder.decode;
            } else {
                this.encoder = JSON;
                this.encode = this.encoder.stringify;
                this.decode = this.encoder.parse;
            }

            this.onclose = null;
            this.onerror = null;
            this.onmessage = null;
            this.onopen = null;

            this.protocol = '';

            this.readyState = 3;    // Closed

            this.openTimer = null;
            this.sendTimers = [];

            var self = this;

            this.openTimer = root.setTimeout(function () {
                self.readyState = 1;    // Open
                self.protocol = 'wamp.2.' + self.transportEncoding;
                self.onopen();
            }, TIMEOUT);

        };

    WebSocket.prototype.close = function (code, reason) {
        var self = this;
        this.readyState = 3;    // Closed
        this.clearTimeouts();
        root.setTimeout(function () {
            self.onclose();
        }, TIMEOUT);
    };

    WebSocket.prototype.abort = function () {
        var self = this;
        this.readyState = 3;    // Closed
        this.clearTimeouts();
        root.setTimeout(function () {
            self.onerror();
        }, TIMEOUT);
    };

    WebSocket.prototype.clearTimeouts = function () {
        if (this.openTimer) {
            root.clearTimeout(this.openTimer);
            this.openTimer = null;
        }

        var l = this.sendTimers.length;
        while (l--) {
            root.clearTimeout(this.sendTimers.pop());
        }
    };

    WebSocket.prototype.send = function (data) {
        var self = this;
        this.sendTimers.push(root.setTimeout(function () {
            var send_data, enc_data, rec_data, i;

            rec_data = self.decode(data);
            send_data = sendData.shift();

            //console.log('Data to send to server:', rec_data);
            //console.log('Data to send to client:', send_data.data);
            if (send_data.data) {
                // Prepare answer (copy request id from request to answer, etc)
                if (send_data.from) {
                    i = send_data.from.length;
                    while (i--) {
                        send_data.data[send_data.to[i]] = rec_data[send_data.from[i]];
                    }
                }

                enc_data = { data: self.encode(send_data.data) };
                self.onmessage(enc_data);
            }

            if (send_data.next) {           // Send to client next message
                self.send(data);
            } else if (send_data.abort) {   // Abort ws connection
                self.abort();
            } else if (send_data.close) {   // Close ws connection
                self.close();
            }
        }, TIMEOUT));
    };

    return WebSocket;

});
