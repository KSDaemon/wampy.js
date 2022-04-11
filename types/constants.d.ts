export declare enum WAMP_MSG_SPEC {
    HELLO = 1,
    WELCOME = 2,
    ABORT = 3,
    CHALLENGE = 4,
    AUTHENTICATE = 5,
    GOODBYE = 6,
    ERROR = 8,
    PUBLISH = 16,
    PUBLISHED = 17,
    SUBSCRIBE = 32,
    SUBSCRIBED = 33,
    UNSUBSCRIBE = 34,
    UNSUBSCRIBED = 35,
    EVENT = 36,
    CALL = 48,
    CANCEL = 49,
    RESULT = 50,
    REGISTER = 64,
    REGISTERED = 65,
    UNREGISTER = 66,
    UNREGISTERED = 67,
    INVOCATION = 68,
    INTERRUPT = 69,
    YIELD = 70
}
export declare const WAMP_ERROR_MSG: {
    readonly SUCCESS: {
        readonly code: 0;
        readonly description: "Success!";
    };
    readonly URI_ERROR: {
        readonly code: 1;
        readonly description: "Topic URI doesn't meet requirements!";
    };
    readonly NO_BROKER: {
        readonly code: 2;
        readonly description: "Server doesn't provide broker role!";
    };
    readonly NO_CALLBACK_SPEC: {
        readonly code: 3;
        readonly description: "No required callback function specified!";
    };
    readonly INVALID_PARAM: {
        readonly code: 4;
        readonly description: "Invalid parameter(s) specified!";
    };
    readonly NO_SERIALIZER_AVAILABLE: {
        readonly code: 6;
        readonly description: "Server has chosen a serializer, which is not available!";
    };
    readonly NON_EXIST_UNSUBSCRIBE: {
        readonly code: 7;
        readonly description: "Trying to unsubscribe from non existent subscription!";
    };
    readonly NO_DEALER: {
        readonly code: 12;
        readonly description: "Server doesn't provide dealer role!";
    };
    readonly RPC_ALREADY_REGISTERED: {
        readonly code: 15;
        readonly description: "RPC already registered!";
    };
    readonly NON_EXIST_RPC_UNREG: {
        readonly code: 17;
        readonly description: "Received rpc unregistration for non existent rpc!";
    };
    readonly NON_EXIST_RPC_INVOCATION: {
        readonly code: 19;
        readonly description: "Received invocation for non existent rpc!";
    };
    readonly NON_EXIST_RPC_REQ_ID: {
        readonly code: 20;
        readonly description: "No RPC calls in action with specified request ID!";
    };
    readonly NO_REALM: {
        readonly code: 21;
        readonly description: "No realm specified!";
    };
    readonly NO_WS_OR_URL: {
        readonly code: 22;
        readonly description: "No websocket provided or URL specified is incorrect!";
    };
    readonly NO_CRA_CB_OR_ID: {
        readonly code: 23;
        readonly description: "No onChallenge callback or authid was provided for authentication!";
    };
    readonly CRA_EXCEPTION: {
        readonly code: 24;
        readonly description: "Exception raised during CRA challenge processing";
    };
};
export declare const ALLOWED_BINARY_TYPES: readonly ["blob", "arraybuffer"];
export declare const isNode: boolean;
//# sourceMappingURL=constants.d.ts.map