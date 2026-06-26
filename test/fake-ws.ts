/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

import sendData from './send-data.js';
import type { SendDataItem } from './send-data.js';
import { MsgpackSerializer } from '../src/serializers/msgpack-serializer.js';
import { JsonSerializer } from '../src/serializers/json-serializer.js';
import { CborSerializer } from '../src/serializers/cbor-serializer.js';
import { WAMP_MSG_SPEC } from '../src/constants.js';
import type { Serializer } from '../src/serializers/serializer.js';

const TIMEOUT = 15;

// Set this to true to enable console.logs
const isDebugMode = false;

const serializers: Record<string, Serializer> = {
    msgpack: new MsgpackSerializer(),
    cbor: new CborSerializer(),
    json: new JsonSerializer(),
};

let sendDataCursor = 0,
    openTimer: ReturnType<typeof setTimeout> | null = null,
    sendTimer: ReturnType<typeof setInterval> | null = null;

const clientMessageHandlersQueue: Array<() => void> = [];

interface FakeWebSocket {
    url: string;
    protocols: string[];
    transportEncoding: string;
    protocol: string;
    binaryType?: string;
    encoder: Serializer;
    encode: Serializer['encode'];
    decode: Serializer['decode'];
    onclose: (() => void) | null;
    onerror: (() => void) | null;
    onmessage: ((event: { data: string | ArrayBuffer | Uint8Array }) => void) | null;
    onopen: (() => void) | null;
    readyState: number;
    close(): void;
    abort(): void;
    send(data: string | ArrayBuffer | Uint8Array): void;
}

interface FakeWebSocketConstructor {
    new (url: string, protocols: string[]): FakeWebSocket;
    prototype: FakeWebSocket;
}

const WebSocket = function (this: FakeWebSocket, url: string, protocols: string[]) {
    this.url = url;
    this.protocols = protocols;
    this.transportEncoding = this.protocols[0].split('.', 3)[2];
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
        this.onopen!();
    }, TIMEOUT);
} as unknown as FakeWebSocketConstructor;

function clearTimers (): void {
    if (openTimer) {
        clearTimeout(openTimer);
        openTimer = null;
    }

    if (sendTimer) {
        clearInterval(sendTimer);
        sendTimer = null;
    }
}

function resetCursor (): void {
    sendDataCursor = 0;
}

function processQueue (): void {
    while (clientMessageHandlersQueue.length > 0) {
        const currentHandler = clientMessageHandlersQueue.shift();
        currentHandler!();
    }
}

function startTimers (): void {
    sendTimer = setInterval(processQueue, TIMEOUT);
}

WebSocket.prototype.close = function (this: FakeWebSocket): void {
    if (openTimer) {
        clearTimeout(openTimer);
        openTimer = null;
    }
    this.readyState = 3;    // Closed
    this.onclose!();
};

WebSocket.prototype.abort = function (this: FakeWebSocket): void {
    if (openTimer) {
        clearTimeout(openTimer);
        openTimer = null;
    }
    this.readyState = 3;    // Closed
    this.onerror!();
};

WebSocket.prototype.send = function (this: FakeWebSocket, data: string | ArrayBuffer | Uint8Array): void {
    const rec_data = this.decode(data) as unknown[];
    const send_data: SendDataItem & { data: unknown[] | null } = structuredClone(sendData[sendDataCursor++]);
    let options: Record<string, unknown> | undefined;

    if (isDebugMode) { console.log('Server received a message:', rec_data); }

    const recMsgType = rec_data?.[0] as number;
    const sendMsgType = (send_data?.data as unknown[])?.[0] as number;

    if (
        ([WAMP_MSG_SPEC.CALL, WAMP_MSG_SPEC.PUBLISH, WAMP_MSG_SPEC.YIELD] as number[]).includes(recMsgType) &&
        ([WAMP_MSG_SPEC.EVENT, WAMP_MSG_SPEC.RESULT, WAMP_MSG_SPEC.INVOCATION] as number[]).includes(sendMsgType)
    ) {
        if (([WAMP_MSG_SPEC.EVENT, WAMP_MSG_SPEC.INVOCATION] as number[]).includes(sendMsgType)) {
            options = (send_data.data as unknown[])[3] as Record<string, unknown>;
        } else if (([WAMP_MSG_SPEC.RESULT] as number[]).includes(sendMsgType)) {
            options = (send_data.data as unknown[])[2] as Record<string, unknown>;
        }

        // Check for PPT mode and encode payload with serializer
        if (options?.ppt_scheme &&
            options.ppt_serializer &&
            options.ppt_serializer !== 'native') {
            const pptSerializer = serializers[options.ppt_serializer as string];

            if (([WAMP_MSG_SPEC.EVENT, WAMP_MSG_SPEC.INVOCATION] as number[]).includes(sendMsgType)) {
                const payload = pptSerializer.encode(((send_data.data as unknown[])[4] as unknown[])[0]);
                const ruinedPayload = `${String(payload)}123`;

                (send_data.data as unknown[])[4] = [send_data.ruinPayload ? ruinedPayload : payload];
            } else if (([WAMP_MSG_SPEC.RESULT] as number[]).includes(sendMsgType)) {
                const payload = pptSerializer.encode(((send_data.data as unknown[])[3] as unknown[])[0]);
                const ruinedPayload = `${String(payload)}123`;

                (send_data.data as unknown[])[3] = [send_data.ruinPayload ? ruinedPayload : payload];
            }
        }
    }

    if (isDebugMode) { console.log('Is silent answer?', Boolean(send_data.silent)); }

    if (send_data.silent) {
        return;
    }

    if (isDebugMode) { console.log('Data to send to client:', send_data.data, 'sendDataCursor:', sendDataCursor); }

    let enc_data: { data: string | ArrayBuffer | Uint8Array } | undefined;

    if (send_data.data) {
        // Prepare answer (copy request id from request to answer, etc)
        if (send_data.from) {
            let i = send_data.from.length;
            while (i--) {
                (send_data.data as unknown[])[send_data.to![i]] = rec_data[send_data.from[i]];
            }
        }

        const message = this.encode(send_data.data);
        const ruinedMessage = `${String(message)}123`;

        enc_data = { data: send_data.ruinMessage ? ruinedMessage : message };
    }

    clientMessageHandlersQueue.push(() => {
        if (send_data.data) {
            this.onmessage!(enc_data!);
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
