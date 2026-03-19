/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 16.06.17
 */

import { JsonSerializer } from '../src/serializers/json-serializer.js';
import { WAMP_MSG_SPEC } from '../src/constants.js';
import type { Serializer } from '../src/serializers/serializer.js';

const TIMEOUT = 15,

    root = globalThis;

let protocol = 'json';

interface FakeWebSocket {
    url: string;
    protocols: string[];
    encoder: Serializer;
    encode: Serializer['encode'];
    decode: Serializer['decode'];
    onclose: (() => void) | null;
    onerror: (() => void) | null;
    onmessage: ((event: { data: string | ArrayBuffer | Uint8Array }) => void) | null;
    onopen: (() => void) | null;
    protocol: string;
    readyState: number;
    close(code?: number, reason?: string): void;
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
            this.onopen!();
        }, TIMEOUT);

    } as unknown as FakeWebSocketConstructor,

    setProtocol = function (proto: string): void {
        protocol = proto;
    };

WebSocket.prototype.close = function (this: FakeWebSocket, _code?: number, _reason?: string): void {
    this.readyState = 3;    // Closed
    this.onclose!();
};

WebSocket.prototype.abort = function (this: FakeWebSocket): void {
    this.readyState = 3;    // Closed
    this.onerror!();
};

WebSocket.prototype.send = function (this: FakeWebSocket, data: string | ArrayBuffer | Uint8Array): void {
    setTimeout(() => {
        this.onmessage!({
            data: this.encode([
                WAMP_MSG_SPEC.WELCOME,
                127,
                {
                    agent: 'Wampy.js test suite',
                    roles: {
                        broker: {
                            features: {
                                subscriber_blackwhite_listing: true,
                                publisher_exclusion: true,
                                publisher_identification: true
                            }
                        },
                        dealer: {
                            features: {
                                caller_identification: true,
                                progressive_call_results: true
                            }
                        }
                    }
                }
            ])
        });
    }, 10);
};

export { WebSocket, setProtocol };
