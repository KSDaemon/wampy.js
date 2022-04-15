export declare const WAMP_MSG_SPEC: {
    readonly HELLO: 1;
    readonly WELCOME: 2;
    readonly ABORT: 3;
    readonly CHALLENGE: 4;
    readonly AUTHENTICATE: 5;
    readonly GOODBYE: 6;
    readonly ERROR: 8;
    readonly PUBLISH: 16;
    readonly PUBLISHED: 17;
    readonly SUBSCRIBE: 32;
    readonly SUBSCRIBED: 33;
    readonly UNSUBSCRIBE: 34;
    readonly UNSUBSCRIBED: 35;
    readonly EVENT: 36;
    readonly CALL: 48;
    readonly CANCEL: 49;
    readonly RESULT: 50;
    readonly REGISTER: 64;
    readonly REGISTERED: 65;
    readonly UNREGISTER: 66;
    readonly UNREGISTERED: 67;
    readonly INVOCATION: 68;
    readonly INTERRUPT: 69;
    readonly YIELD: 70;
};
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
declare const _default: {
    isNode: boolean;
    ALLOWED_BINARY_TYPES: readonly ["blob", "arraybuffer"];
    WAMP_ERROR_MSG: {
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
    WAMP_MSG_SPEC: {
        readonly HELLO: 1;
        readonly WELCOME: 2;
        readonly ABORT: 3;
        readonly CHALLENGE: 4;
        readonly AUTHENTICATE: 5;
        readonly GOODBYE: 6;
        readonly ERROR: 8;
        readonly PUBLISH: 16;
        readonly PUBLISHED: 17;
        readonly SUBSCRIBE: 32;
        readonly SUBSCRIBED: 33;
        readonly UNSUBSCRIBE: 34;
        readonly UNSUBSCRIBED: 35;
        readonly EVENT: 36;
        readonly CALL: 48;
        readonly CANCEL: 49;
        readonly RESULT: 50;
        readonly REGISTER: 64;
        readonly REGISTERED: 65;
        readonly UNREGISTER: 66;
        readonly UNREGISTERED: 67;
        readonly INVOCATION: 68;
        readonly INTERRUPT: 69;
        readonly YIELD: 70;
    };
};
export default _default;
//# sourceMappingURL=constants.d.ts.map