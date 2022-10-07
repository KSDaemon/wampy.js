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

export const SUCCESS = {
    code: 0,
    error: null
};

export const WAMP_ERROR_MSG = {
    SUCCESS: 'Success!',
    URI_ERROR: 'Topic URI doesn\'t meet requirements!',
    NO_BROKER: 'Server doesn\'t provide broker role!',
    NO_CALLBACK_SPEC: 'No required callback function specified!',
    INVALID_PARAM: 'Invalid parameter(s) specified!',
    NO_SERIALIZER_AVAILABLE: 'Server has chosen a serializer, which is not available!',
    NON_EXIST_UNSUBSCRIBE: 'Trying to unsubscribe from non existent subscription!',
    NO_DEALER: 'Server doesn\'t provide dealer role!',
    RPC_ALREADY_REGISTERED: 'RPC already registered!',
    NON_EXIST_RPC_UNREG: 'Received rpc unregistration for non existent rpc!',
    NON_EXIST_RPC_INVOCATION: 'Received invocation for non existent rpc!',
    NON_EXIST_RPC_REQ_ID: 'No RPC calls in action with specified request ID!',
    NO_REALM: 'No realm specified!',
    NO_WS_OR_URL: 'No websocket provided or URL specified is incorrect!',
    NO_CRA_CB_OR_ID: 'No onChallenge callback or authid was provided for authentication!',
    CHALLENGE_EXCEPTION: 'Exception raised during challenge processing',
    PPT_NOT_SUPPORTED: 'Payload Passthru Mode is not supported by the router',
    PPT_INVALID_SCHEME: 'Provided PPT scheme is invalid',
    PPT_SRLZ_INVALID: 'Provided PPT serializer is invalid or not supported',
    PPT_SRLZ_ERR: 'Can not serialize/deserialize payload',
    PROTOCOL_VIOLATION: 'Protocol violation',
    WAMP_ABORT: 'Router aborted connection',
    WAMP_GENERAL_ERROR: 'Wamp error',
    WEBSOCKET_ERROR: 'Websocket error'
};

export const E2EE_SERIALIZERS = ['cbor'];

export const isNode = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]');
