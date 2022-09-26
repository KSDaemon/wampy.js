/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

import lodash from 'lodash';
import sendData from './send-data.js';
import { MsgpackSerializer } from '../src/serializers/MsgpackSerializer.js';
import { JsonSerializer } from '../src/serializers/JsonSerializer.js';
import { CborSerializer } from '../src/serializers/CborSerializer.js';
import { WAMP_MSG_SPEC } from '../src/constants.js';

const TIMEOUT = 20;

let sendDataCursor = 0,
    clientMessageQueue = [],
    openTimer = null,
    sendTimer = null,

    WebSocket = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;
        this.transportEncoding = this.protocols[0].split('.')[2];

        switch (this.transportEncoding) {
            case 'msgpack':
                this.binaryType = 'arraybuffer';
                this.encoder = new MsgpackSerializer();
                break;
            case 'cbor':
                this.binaryType = 'arraybuffer';
                this.encoder = new CborSerializer();
                break;
            default:
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

        switch (this.transportEncoding) {
            case 'msgpack':
                this.binaryType = 'arraybuffer';
                this.encoder = new MsgpackSerializer();
                this.encode = function (data) {
                    return new Blob([new Uint8Array(this.encoder.encode(data))]);
                };
                break;
            case 'cbor':
                this.binaryType = 'arraybuffer';
                this.encoder = new CborSerializer();
                this.encode = this.encoder.encode;
                break;
            default:
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

        this.decode(data).then(rec_data => {
            let send_data, enc_data, i, opts, pptSerializer;

            send_data = lodash.cloneDeep(sendData[sendDataCursor++]);

            if ((rec_data[0] === WAMP_MSG_SPEC.CALL ||
                rec_data[0] === WAMP_MSG_SPEC.PUBLISH ||
                rec_data[0] === WAMP_MSG_SPEC.YIELD) &&
                send_data.data &&
                (send_data.data[0] === WAMP_MSG_SPEC.EVENT ||
                send_data.data[0] === WAMP_MSG_SPEC.RESULT ||
                send_data.data[0] === WAMP_MSG_SPEC.INVOCATION)) {

                if (send_data.data[0] === WAMP_MSG_SPEC.EVENT) {
                    opts = send_data.data[3];
                } else if (send_data.data[0] === WAMP_MSG_SPEC.RESULT) {
                    opts = send_data.data[2];
                } else if (send_data.data[0] === WAMP_MSG_SPEC.INVOCATION) {
                    opts = send_data.data[3];
                }

                // Check for PPT mode and encode payload with appreciate serializer
                if (opts.ppt_scheme &&
                    opts.ppt_serializer &&
                    opts.ppt_serializer !== 'native') {
                    switch (opts.ppt_serializer) {
                        case 'cbor':
                            pptSerializer = new CborSerializer();
                            break;
                        case 'msgpack':
                            pptSerializer = new MsgpackSerializer();
                            break;
                        case 'json':
                            pptSerializer = new JsonSerializer();
                            break;
                    }

                    if (send_data.data[0] === WAMP_MSG_SPEC.EVENT) {
                        send_data.data[4] = [
                            send_data.ruinPayload ?
                                pptSerializer.encode(send_data.data[4][0]) + '123' :
                                pptSerializer.encode(send_data.data[4][0])
                        ];
                    } else if (send_data.data[0] === WAMP_MSG_SPEC.RESULT) {
                        send_data.data[3] = [
                            send_data.ruinPayload ?
                                pptSerializer.encode(send_data.data[3][0]) + '123' :
                                pptSerializer.encode(send_data.data[3][0])
                        ];
                    } else if (send_data.data[0] === WAMP_MSG_SPEC.INVOCATION) {
                        send_data.data[4] = [
                            send_data.ruinPayload ?
                                pptSerializer.encode(send_data.data[4][0]) + '123' :
                                pptSerializer.encode(send_data.data[4][0])
                        ];
                    }
                }
            }

            // console.log('Data received by server:', rec_data);
            // console.log('Is silent answer? ', send_data.silent ? 'yes' : 'no');
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

