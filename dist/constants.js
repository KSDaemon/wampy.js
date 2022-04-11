"use strict";
exports.__esModule = true;
exports.isNode = exports.ALLOWED_BINARY_TYPES = exports.WAMP_ERROR_MSG = exports.WAMP_MSG_SPEC = void 0;
var WAMP_MSG_SPEC;
(function (WAMP_MSG_SPEC) {
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["HELLO"] = 1] = "HELLO";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["WELCOME"] = 2] = "WELCOME";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["ABORT"] = 3] = "ABORT";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["CHALLENGE"] = 4] = "CHALLENGE";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["AUTHENTICATE"] = 5] = "AUTHENTICATE";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["GOODBYE"] = 6] = "GOODBYE";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["ERROR"] = 8] = "ERROR";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["PUBLISH"] = 16] = "PUBLISH";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["PUBLISHED"] = 17] = "PUBLISHED";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["SUBSCRIBE"] = 32] = "SUBSCRIBE";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["SUBSCRIBED"] = 33] = "SUBSCRIBED";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["UNSUBSCRIBE"] = 34] = "UNSUBSCRIBE";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["UNSUBSCRIBED"] = 35] = "UNSUBSCRIBED";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["EVENT"] = 36] = "EVENT";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["CALL"] = 48] = "CALL";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["CANCEL"] = 49] = "CANCEL";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["RESULT"] = 50] = "RESULT";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["REGISTER"] = 64] = "REGISTER";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["REGISTERED"] = 65] = "REGISTERED";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["UNREGISTER"] = 66] = "UNREGISTER";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["UNREGISTERED"] = 67] = "UNREGISTERED";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["INVOCATION"] = 68] = "INVOCATION";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["INTERRUPT"] = 69] = "INTERRUPT";
    WAMP_MSG_SPEC[WAMP_MSG_SPEC["YIELD"] = 70] = "YIELD";
})(WAMP_MSG_SPEC = exports.WAMP_MSG_SPEC || (exports.WAMP_MSG_SPEC = {}));
exports.WAMP_ERROR_MSG = {
    SUCCESS: {
        code: 0,
        description: "Success!"
    },
    URI_ERROR: {
        code: 1,
        description: "Topic URI doesn't meet requirements!"
    },
    NO_BROKER: {
        code: 2,
        description: "Server doesn't provide broker role!"
    },
    NO_CALLBACK_SPEC: {
        code: 3,
        description: "No required callback function specified!"
    },
    INVALID_PARAM: {
        code: 4,
        description: "Invalid parameter(s) specified!"
    },
    NO_SERIALIZER_AVAILABLE: {
        code: 6,
        description: "Server has chosen a serializer, which is not available!"
    },
    NON_EXIST_UNSUBSCRIBE: {
        code: 7,
        description: "Trying to unsubscribe from non existent subscription!"
    },
    NO_DEALER: {
        code: 12,
        description: "Server doesn't provide dealer role!"
    },
    RPC_ALREADY_REGISTERED: {
        code: 15,
        description: "RPC already registered!"
    },
    NON_EXIST_RPC_UNREG: {
        code: 17,
        description: "Received rpc unregistration for non existent rpc!"
    },
    NON_EXIST_RPC_INVOCATION: {
        code: 19,
        description: "Received invocation for non existent rpc!"
    },
    NON_EXIST_RPC_REQ_ID: {
        code: 20,
        description: "No RPC calls in action with specified request ID!"
    },
    NO_REALM: {
        code: 21,
        description: "No realm specified!"
    },
    NO_WS_OR_URL: {
        code: 22,
        description: "No websocket provided or URL specified is incorrect!"
    },
    NO_CRA_CB_OR_ID: {
        code: 23,
        description: "No onChallenge callback or authid was provided for authentication!"
    },
    CRA_EXCEPTION: {
        code: 24,
        description: "Exception raised during CRA challenge processing"
    }
};
exports.ALLOWED_BINARY_TYPES = ["blob", "arraybuffer"];
exports.isNode = typeof process === "object" &&
    Object.prototype.toString.call(process) === "[object process]";
//# sourceMappingURL=constants.js.map