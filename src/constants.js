export const WAMP_MSG_SPEC = {
    HELLO: 1,
    WELCOME: 2,
    ABORT: 3,
    CHALLENGE: 4,
    AUTHENTICATE: 5,
    GOODBYE: 6,
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
};

export const WAMP_ERROR_MSG = {
    SUCCESS: {
        code: 0,
        description: 'Success!'
    },
    URI_ERROR: {
        code: 1,
        description: 'Topic URI doesn\'t meet requirements!'
    },
    NO_BROKER: {
        code: 2,
        description: 'Server doesn\'t provide broker role!'
    },
    NO_CALLBACK_SPEC: {
        code: 3,
        description: 'No required callback function specified!'
    },
    INVALID_PARAM: {
        code: 4,
        description: 'Invalid parameter(s) specified!'
    },
    NO_SERIALIZER_AVAILABLE: {
        code: 6,
        description: 'Server has chosen a serializer, which is not available!'
    },
    NON_EXIST_UNSUBSCRIBE: {
        code: 7,
        description: 'Trying to unsubscribe from non existent subscription!'
    },
    NO_DEALER: {
        code: 12,
        description: 'Server doesn\'t provide dealer role!'
    },
    RPC_ALREADY_REGISTERED: {
        code: 15,
        description: 'RPC already registered!'
    },
    NON_EXIST_RPC_UNREG: {
        code: 17,
        description: 'Received rpc unregistration for non existent rpc!'
    },
    NON_EXIST_RPC_INVOCATION: {
        code: 19,
        description: 'Received invocation for non existent rpc!'
    },
    NON_EXIST_RPC_REQ_ID: {
        code: 20,
        description: 'No RPC calls in action with specified request ID!'
    },
    NO_REALM: {
        code: 21,
        description: 'No realm specified!'
    },
    NO_WS_OR_URL: {
        code: 22,
        description: 'No websocket provided or URL specified is incorrect!'
    },
    NO_CRA_CB_OR_ID: {
        code: 23,
        description: 'No onChallenge callback or authid was provided for authentication!'
    },
    CRA_EXCEPTION: {
        code: 24,
        description: 'Exception raised during CRA challenge processing'
    }
};

export const ALLOWED_BINARY_TYPES = ['blob', 'arraybuffer'];

export const isNode = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]');
