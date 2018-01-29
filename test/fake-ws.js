/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

import sendData from './send-data';
import { MsgpackSerializer } from './../src/serializers/MsgpackSerializer';
import { JsonSerializer } from './../src/serializers/JsonSerializer';

const TIMEOUT = 15;

let sendDataCursor = 0,
    clientMessageQueue = [],
    openTimer = null,
    sendTimer = null,

    WebSocket = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;
        this.transportEncoding = this.protocols[0].split('.')[2];

        if (this.transportEncoding === 'msgpack') {
            this.binaryType = 'arraybuffer';
            this.encoder = new MsgpackSerializer();
        } else {
            this.encoder = new JsonSerializer();
        }

        this.encode = this.encoder.encode;
        this.decode = this.encoder.decode;

        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;

        this.protocol = '';

        this.readyState = 1;    // Closed

        openTimer = setTimeout(() => {
            this.protocol = 'wamp.2.' + this.transportEncoding;
            this.onopen();
        }, TIMEOUT);
    },
    WebSocketBlob = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;
        this.transportEncoding = this.protocols[0].split('.')[2];

        if (this.transportEncoding === 'msgpack') {
            this.binaryType = 'arraybuffer';
            this.encoder = new MsgpackSerializer();

            this.encode = function (data) {
                return new Blob([new Uint8Array(this.encoder.encode(data))]);
            };

        } else {
            this.encoder = new JsonSerializer();
            this.encode = this.encoder.encode;
        }

        this.decode = this.encoder.decode;

        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;

        this.protocol = '';

        this.readyState = 1;    // Closed

        openTimer = setTimeout(() => {
            this.protocol = 'wamp.2.' + this.transportEncoding;
            this.onopen();
        }, TIMEOUT);
    };

function clearTimers () {
    if (openTimer) {
        clearTimeout(openTimer);
        openTimer = null;
    }

    if (sendTimer) {
        clearInterval(sendTimer);
        sendTimer = null;
    }
}

function resetCursor () {
    sendDataCursor = 0;
}

function processQueue () {
    let f;

    if (clientMessageQueue.length) {
        f = clientMessageQueue.shift();
        f();
    }
}

function startTimers () {
    sendTimer = setInterval(processQueue, TIMEOUT);
}

[WebSocketBlob, WebSocket].forEach(function (WebSocket) {
    WebSocket.prototype.close = function (code, reason) {
        if (openTimer) {
            clearTimeout(openTimer);
            openTimer = null;
        }
        this.readyState = 3;    // Closed
        this.onclose();
    };

    WebSocket.prototype.abort = function () {
        if (openTimer) {
            clearTimeout(openTimer);
            openTimer = null;
        }
        this.readyState = 3;    // Closed
        this.onerror();
    };

    WebSocket.prototype.send = function (data) {
        let send_data, enc_data, i;

        this.decode(data).then(rec_data => {
            send_data = sendData[sendDataCursor++];

            //console.log('Data to send to server:', rec_data);
            //console.log('Is silent:', send_data.silent ? 'yes' : 'no');
            if (send_data.silent) {
                return;
            }

            // console.log('Data to send to client:', send_data.data, ' sendDataCursor: ', sendDataCursor);

            if (send_data.data) {
                // Prepare answer (copy request id from request to answer, etc)
                if (send_data.from) {
                    i = send_data.from.length;
                    while (i--) {
                        send_data.data[send_data.to[i]] = rec_data[send_data.from[i]];
                    }
                }

                enc_data = { data: this.encode(send_data.data) };
            }

            clientMessageQueue.push(() => {
                if (send_data.data) {
                    this.onmessage(enc_data);
                }

                // console.log('processsing message: data? ', send_data.data ? 'yes' : 'no',
                //    ' next? ', send_data.next ? 'yes' : 'no',
                //    ' abort? ', send_data.abort ? 'yes' : 'no',
                //    ' close? ', send_data.close ? 'yes' : 'no')
                if (send_data.next) {           // Send to client next message
                    setTimeout(() => {
                        this.send(data);
                    }, TIMEOUT);
                } else if (send_data.abort) {   // Abort ws connection
                    setTimeout(() => {
                        this.abort();
                    }, TIMEOUT);
                } else if (send_data.close) {   // Close ws connection
                    setTimeout(() => {
                        this.close();
                    }, TIMEOUT);
                }
            });
        });
    };
});

export { WebSocket, WebSocketBlob, startTimers, clearTimers, resetCursor };

