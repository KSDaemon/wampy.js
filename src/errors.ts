import { WAMP_ERROR_MSG } from './constants.js';

export class UriError extends Error {
    readonly code = 1;

    constructor () {
        super(WAMP_ERROR_MSG.URI_ERROR);
        this.name = 'UriError';
    }
}

export class NoBrokerError extends Error {
    readonly code = 2;

    constructor () {
        super(WAMP_ERROR_MSG.NO_BROKER);
        this.name = 'NoBrokerError';
    }
}

export class NoCallbackError extends Error {
    readonly code = 3;

    constructor () {
        super(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);
        this.name = 'NoCallbackError';
    }
}

export class InvalidParamError extends Error {
    readonly code = 4;
    readonly parameter: string;

    constructor (parameter: string) {
        super(WAMP_ERROR_MSG.INVALID_PARAM);
        this.name = 'InvalidParamError';
        this.parameter = parameter;
    }
}

export class NoSerializerAvailableError extends Error {
    readonly code = 6;

    constructor () {
        super(WAMP_ERROR_MSG.NO_SERIALIZER_AVAILABLE);
        this.name = 'NoSerializerAvailableError';
    }
}

export class NonExistUnsubscribeError extends Error {
    readonly code = 7;

    constructor () {
        super(WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE);
        this.name = 'NonExistUnsubscribeError';
    }
}

export class NoDealerError extends Error {
    readonly code = 12;

    constructor () {
        super(WAMP_ERROR_MSG.NO_DEALER);
        this.name = 'NoDealerError';
    }
}

export class RPCAlreadyRegisteredError extends Error {
    readonly code = 15;

    constructor () {
        super(WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED);
        this.name = 'RPCAlreadyRegisteredError';
    }
}

export class NonExistRPCUnregistrationError extends Error {
    readonly code = 17;

    constructor () {
        super(WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG);
        this.name = 'NonExistRPCUnregistrationError';
    }
}

// Not being used at the moment, but left commented here in case we need it
// export class NonExistRPCInvocationError extends Error {
//     readonly code = 19;
//
//     constructor () {
//         super(WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION);
//         this.name = 'NonExistRPCInvocationError';
//     }
// }

export class NonExistRPCReqIdError extends Error {
    readonly code = 20;

    constructor () {
        super(WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID);
        this.name = 'NonExistRPCReqIdError';
    }
}

export class NoRealmError extends Error {
    readonly code = 21;

    constructor () {
        super(WAMP_ERROR_MSG.NO_REALM);
        this.name = 'NoRealmError';
    }
}

export class NoWsOrUrlError extends Error {
    readonly code = 22;

    constructor () {
        super(WAMP_ERROR_MSG.NO_WS_OR_URL);
        this.name = 'NoWsOrUrlError';
    }
}

export class NoCRACallbackOrIdError extends Error {
    readonly code = 23;
    readonly errorUri = 'wamp.error.cannot_authenticate';

    constructor () {
        super(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);
        this.name = 'NoCRACallbackOrIdError';
    }
}

export class ChallengeExceptionError extends Error {
    readonly code = 24;
    readonly errorUri = 'wamp.error.cannot_authenticate';

    constructor () {
        super(WAMP_ERROR_MSG.CHALLENGE_EXCEPTION);
        this.name = 'ChallengeExceptionError';
    }
}

export class PPTNotSupportedError extends Error {
    readonly code = 25;

    constructor () {
        super(WAMP_ERROR_MSG.PPT_NOT_SUPPORTED);
        this.name = 'PPTNotSupportedError';
    }
}

export class PPTInvalidSchemeError extends Error {
    readonly code = 26;

    constructor () {
        super(WAMP_ERROR_MSG.PPT_INVALID_SCHEME);
        this.name = 'PPTInvalidSchemeError';
    }
}

export class PPTSerializerInvalidError extends Error {
    readonly code = 27;

    constructor () {
        super(WAMP_ERROR_MSG.PPT_SRLZ_INVALID);
        this.name = 'PPTSerializerInvalidError';
    }
}

export class PPTSerializationError extends Error {
    readonly code = 28;

    constructor () {
        super(WAMP_ERROR_MSG.PPT_SRLZ_ERR);
        this.name = 'PPTSerializationError';
    }
}

export interface ProtocolViolationErrorParams {
    errorUri: string;
    details?: string;
}

export class ProtocolViolationError extends Error {
    readonly code = 29;
    readonly errorUri: string;

    constructor (errorUri: string, details?: string) {
        super(details || WAMP_ERROR_MSG.PROTOCOL_VIOLATION);
        this.name = 'ProtocolViolationError';
        this.errorUri = errorUri;
    }
}

export interface WampErrorParams {
    error: string;
    details: Record<string, unknown>;
    argsList?: unknown[];
    argsDict?: Record<string, unknown>;
}

export class AbortError extends Error {
    readonly code = 30;
    readonly errorUri: string;
    readonly details: Record<string, unknown>;

    constructor ({ error, details }: { error: string; details: Record<string, unknown> }) {
        super(WAMP_ERROR_MSG.WAMP_ABORT);
        this.name = 'AbortedError';
        this.errorUri = error;
        this.details = details;
    }
}

export class WampError extends Error {
    readonly code: number = 31;
    readonly errorUri: string;
    readonly details: Record<string, unknown>;
    readonly argsList?: unknown[];
    readonly argsDict?: Record<string, unknown>;

    constructor ({ error, details, argsList, argsDict }: WampErrorParams) {
        super(WAMP_ERROR_MSG.WAMP_GENERAL_ERROR);
        this.name = 'WampError';
        this.errorUri = error;
        this.details = details;
        this.argsList = argsList;
        this.argsDict = argsDict;
    }
}

export class SubscribeError extends WampError {
    override readonly code = 32;

    constructor ({ error, details, argsList, argsDict }: WampErrorParams) {
        super({ error, details, argsList, argsDict });
        this.name = 'SubscribeError';
    }
}

export class UnsubscribeError extends WampError {
    override readonly code = 33;

    constructor ({ error, details, argsList, argsDict }: WampErrorParams) {
        super({ error, details, argsList, argsDict });
        this.name = 'UnsubscribeError';
    }
}

export class PublishError extends WampError {
    override readonly code = 34;

    constructor ({ error, details, argsList, argsDict }: WampErrorParams) {
        super({ error, details, argsList, argsDict });
        this.name = 'PublishError';
    }
}

export class RegisterError extends WampError {
    override readonly code = 35;

    constructor ({ error, details, argsList, argsDict }: WampErrorParams) {
        super({ error, details, argsList, argsDict });
        this.name = 'RegisterError';
    }
}

export class UnregisterError extends WampError {
    override readonly code = 36;

    constructor ({ error, details, argsList, argsDict }: WampErrorParams) {
        super({ error, details, argsList, argsDict });
        this.name = 'UnregisterError';
    }
}

export class CallError extends WampError {
    override readonly code = 37;

    constructor ({ error, details, argsList, argsDict }: WampErrorParams) {
        super({ error, details, argsList, argsDict });
        this.name = 'CallError';
    }
}

export class WebsocketError extends Error {
    readonly code = 38;
    readonly error: unknown;

    constructor (error: unknown) {
        super(WAMP_ERROR_MSG.WEBSOCKET_ERROR);
        this.name = 'WebsocketError';
        this.error = error;
    }
}

export class FeatureNotSupportedError extends Error {
    readonly code = 39;
    readonly role: string;
    readonly feature: string;

    constructor (role: string, feature: string) {
        super(WAMP_ERROR_MSG.FEATURE_NOT_SUPPORTED);
        this.name = 'FeatureNotSupportedError';
        this.role = role;
        this.feature = feature;
    }
}
