/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

import lodash from 'lodash';
import sendData from './send-data.js';
import { MsgpackSerializer } from '../src/serializers/msgpack-serializer.js';
import { JsonSerializer } from '../src/serializers/json-serializer.js';
import { CborSerializer } from '../src/serializers/cbor-serializer.js';
import { WAMP_MSG_SPEC } from '../src/constants.js';

const TIMEOUT = 15;

// Set this to true to enable console.logs
const isDebugMode = false;

const serializers = {
    msgpack: new MsgpackSerializer(),
    cbor: new CborSerializer(),
    json: new JsonSerializer(),
};

let sendDataCursor = 0,
    openTimer = null,
    sendTimer = null;

const clientMessageHandlersQueue = [],
    WebSocket = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;
        this.transportEncoding = this.protocols[0].split('.')[2];
        this.protocol = `wamp.2.${this.transportEncoding}`;

        if (['msgpack', 'cbor'].includes(this.transportEncoding)) {
            this.binaryType = 'arraybuffer';
        }

        this.encoder = serializers[this.transportEncoding] || new JsonSerializer();

        this.encode = this.encoder.encode;
        this.decode = this.encoder.decode;

        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;

        this.readyState = 1;    // Closed

        openTimer = setTimeout(() => {
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
    let currentHandler;

    while (clientMessageHandlersQueue.length > 0) {
        currentHandler = clientMessageHandlersQueue.shift();
        currentHandler();
    }
}

function startTimers () {
    sendTimer = setInterval(processQueue, TIMEOUT);
}

WebSocket.prototype.close = function () {
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
    const rec_data = this.decode(data);
    const send_data = lodash.cloneDeep(sendData[sendDataCursor++]);
    let options;

    if (isDebugMode) { console.log('Server received a message:', rec_data); }

    if (
        ([WAMP_MSG_SPEC.CALL, WAMP_MSG_SPEC.PUBLISH, WAMP_MSG_SPEC.YIELD].includes(rec_data?.[0])) &&
        ([WAMP_MSG_SPEC.EVENT, WAMP_MSG_SPEC.RESULT, WAMP_MSG_SPEC.INVOCATION].includes(send_data?.data?.[0]))
    ) {
        if ([WAMP_MSG_SPEC.EVENT, WAMP_MSG_SPEC.INVOCATION].includes(send_data.data[0])) {
            options = send_data.data[3];
        } else if ([WAMP_MSG_SPEC.RESULT].includes(send_data.data[0])) {
            options = send_data.data[2];
        }

        // Check for PPT mode and encode payload with serializer
        if (options.ppt_scheme &&
            options.ppt_serializer &&
            options.ppt_serializer !== 'native') {
            const pptSerializer = serializers[options.ppt_serializer];

            if ([WAMP_MSG_SPEC.EVENT, WAMP_MSG_SPEC.INVOCATION].includes(send_data.data[0])) {
                const payload = pptSerializer.encode(send_data.data[4][0]);
                const ruinedPayload = `${String(payload)}123`;

                send_data.data[4] = [send_data.ruinPayload ? ruinedPayload : payload];
            } else if ([WAMP_MSG_SPEC.RESULT].includes(send_data.data[0])) {
                const payload = pptSerializer.encode(send_data.data[3][0]);
                const ruinedPayload = `${String(payload)}123`;

                send_data.data[3] = [send_data.ruinPayload ? ruinedPayload : payload];
            }
        }
    }

    if (isDebugMode) { console.log('Is silent answer?', Boolean(send_data.silent)); }

    if (send_data.silent) {
        return;
    }

    if (isDebugMode) { console.log('Data to send to client:', send_data.data, 'sendDataCursor:', sendDataCursor); }

    let enc_data;

    if (send_data.data) {
        // Prepare answer (copy request id from request to answer, etc)
        if (send_data.from) {
            let i = send_data.from.length;
            while (i--) {
                send_data.data[send_data.to[i]] = rec_data[send_data.from[i]];
            }
        }

        const message = this.encode(send_data.data);
        const ruinedMessage = `${String(message)}123`;

        enc_data = { data: send_data.ruinMessage ? ruinedMessage : message };
    }

    clientMessageHandlersQueue.push(() => {
        if (send_data.data) {
            this.onmessage(enc_data);
        }

        if (isDebugMode) { console.log('Processing message:',
            'data?', Boolean(send_data.data),
            'next?', Boolean(send_data.next),
            'abort?', Boolean(send_data.abort),
            'close?', Boolean(send_data.close)); }

        if (send_data.next) {           // Send next message to client
            setTimeout(() => { this.send(data); }, TIMEOUT);
        } else if (send_data.abort) {   // Abort websocket connection
            setTimeout(() => { this.abort(); }, TIMEOUT);
        } else if (send_data.close) {   // Close websocket connection
            setTimeout(() => { this.close(); }, TIMEOUT);
        }
    });
};

export { WebSocket, startTimers, clearTimers, resetCursor };
