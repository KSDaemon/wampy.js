import { WAMP_MSG_SPEC } from "../src/constants.js";
import customAttrsData from "./custom-attributes-data.js";

let messageQueue = [];
const isDebugMode = false;

const WebSocket = function (url, protocols) {
    this.url = url;
    this.protocol = protocols && protocols.length > 0 ? protocols[0] : undefined;
    this.readyState = WebSocket.CONNECTING;
    this.extensions = "";
    this.bufferedAmount = 0;
    this.binaryType = "arraybuffer";

    messageQueue = [...customAttrsData];

    setTimeout(() => {
        this.readyState = WebSocket.OPEN;
        if (this.onopen) {
            this.onopen();
        }
    }, 1);
};

WebSocket.prototype.encode = function (data) {
    return JSON.stringify(data);
};

WebSocket.prototype.decode = function (data) {
    return JSON.parse(data);
};

WebSocket.prototype.close = function () {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
        this.onclose();
    }
};

WebSocket.prototype.abort = function () {
    this.readyState = WebSocket.CLOSED;
    if (this.onerror) {
        this.onerror();
    }
};

WebSocket.prototype.send = function (data) {
    const receivedMessage = this.decode(data);

    if (isDebugMode) {
        console.log("Mock received:", receivedMessage);
    }

    const response = this.findResponse(receivedMessage);

    if (response) {
        const responseData = this.processResponse(response, receivedMessage);

        if (responseData) {
            setTimeout(() => {
                if (isDebugMode) {
                    console.log("Mock sending:", responseData);
                }
                if (this.onmessage) {
                    this.onmessage({ data: this.encode(responseData) });
                }
            }, response.delay || 1);
        }
    }
};

WebSocket.prototype.findResponse = function (receivedMessage) {
    const [messageType, requestId] = receivedMessage;

    for (const item of messageQueue) {
        if (item.trigger && item.trigger.messageType === messageType) {
            if ( !item.trigger.condition || item.trigger.condition(receivedMessage) ) {
                return item;
            } else {
                continue;
            }
        }
    }

    const defaultResponses = {
        [WAMP_MSG_SPEC.HELLO]: {
            response: [
                WAMP_MSG_SPEC.WELCOME,
                12345,
                {
                    agent: "Custom Attrs Test Router",
                    roles: {
                        broker: { features: {} },
                        dealer: { features: { call_canceling: true } },
                    },
                },
            ],
        },
        [WAMP_MSG_SPEC.SUBSCRIBE]: {
            response: [
                WAMP_MSG_SPEC.SUBSCRIBED,
                requestId,
                Math.floor(Math.random() * 10000),
            ],
        },
        [WAMP_MSG_SPEC.PUBLISH]: {
            response: [
                WAMP_MSG_SPEC.PUBLISHED,
                requestId,
                Math.floor(Math.random() * 10000),
            ],
        },
        [WAMP_MSG_SPEC.CALL]: {
            response: [WAMP_MSG_SPEC.RESULT, requestId, {}, ["result"]],
        },
        [WAMP_MSG_SPEC.REGISTER]: {
            response: [
                WAMP_MSG_SPEC.REGISTERED,
                requestId,
                Math.floor(Math.random() * 10000),
            ],
        },
        [WAMP_MSG_SPEC.GOODBYE]: {
            response: [WAMP_MSG_SPEC.GOODBYE, {}, "wamp.close.normal"],
        },
    };

    return defaultResponses[messageType];
};

WebSocket.prototype.processResponse = function (responseItem, receivedMessage) {
    if (responseItem.response) {
        const response = [...responseItem.response];

        if (response[1] === "REQUEST_ID") {
            response[1] = receivedMessage[1];
        }

        return response;
    }

    return null;
};

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

export default WebSocket;
