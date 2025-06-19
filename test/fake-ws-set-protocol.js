/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 16.06.17
 */

import { JsonSerializer } from '../src/serializers/json-serializer.js';
import { WAMP_MSG_SPEC } from '../src/constants.js';

const TIMEOUT = 15,

    root = globalThis;

let protocol = 'json';

const WebSocket = function (url, protocols) {
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

WebSocket.prototype.send = function (data) {
    setTimeout(() => {
        this.onmessage({
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

