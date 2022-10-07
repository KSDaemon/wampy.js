import { WAMP_ERROR_MSG } from './constants.js';

export class UriError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.URI_ERROR);
        this.name = 'UriError';
        this.code = 1;
    }
}

export class NoBrokerError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NO_BROKER);
        this.name = 'NoBrokerError';
        this.code = 2;
    }
}

export class NoCallbackError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NO_CALLBACK_SPEC);
        this.name = 'NoCallbackError';
        this.code = 3;
    }
}

export class InvalidParamError extends Error {
    constructor (parameter) {
        super(WAMP_ERROR_MSG.INVALID_PARAM);
        this.name = 'InvalidParamError';
        this.code = 4;
        this.parameter = parameter;
    }
}

export class NoSerializerAvailableError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NO_SERIALIZER_AVAILABLE);
        this.name = 'NoSerializerAvailableError';
        this.code = 6;
    }
}

export class NonExistUnsubscribeError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE);
        this.name = 'NonExistUnsubscribeError';
        this.code = 7;
    }
}

export class NoDealerError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NO_DEALER);
        this.name = 'NoDealerError';
        this.code = 12;
    }
}

export class RPCAlreadyRegisteredError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED);
        this.name = 'RPCAlreadyRegisteredError';
        this.code = 15;
    }
}

export class NonExistRPCUnregistrationError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG);
        this.name = 'NonExistRPCUnregistrationError';
        this.code = 17;
    }
}

export class NonExistRPCInvocationError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION);
        this.name = 'NonExistRPCInvocationError';
        this.code = 19;
    }
}

export class NonExistRPCReqIdError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID);
        this.name = 'NonExistRPCReqIdError';
        this.code = 20;
    }
}

export class NoRealmError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NO_REALM);
        this.name = 'NoRealmError';
        this.code = 21;
    }
}

export class NoWsOrUrlError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NO_WS_OR_URL);
        this.name = 'NoWsOrUrlError';
        this.code = 22;
    }
}

export class NoCRACallbackOrIdError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);
        this.name = 'NoCRACallbackOrIdError';
        this.code = 23;
        this.errorUri = 'wamp.error.cannot_authenticate';
    }
}

export class ChallengeExceptionError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.CHALLENGE_EXCEPTION);
        this.name = 'ChallengeExceptionError';
        this.code = 24;
        this.errorUri = 'wamp.error.cannot_authenticate';
    }
}

export class PPTNotSupportedError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.PPT_NOT_SUPPORTED);
        this.name = 'PPTNotSupportedError';
        this.code = 25;
    }
}

export class PPTInvalidSchemeError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.PPT_INVALID_SCHEME);
        this.name = 'PPTInvalidSchemeError';
        this.code = 26;
    }
}

export class PPTSerializerInvalidError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.PPT_SRLZ_INVALID);
        this.name = 'PPTSerializerInvalidError';
        this.code = 27;
    }
}

export class PPTSerializationError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.PPT_SRLZ_ERR);
        this.name = 'PPTSerializationError';
        this.code = 28;
    }
}

export class ProtocolViolationError extends Error {
    constructor (errorUri, details) {
        super(details || WAMP_ERROR_MSG.PROTOCOL_VIOLATION);
        this.name = 'ProtocolViolationError';
        this.code = 29;
        this.errorUri = errorUri;
    }
}

export class AbortError extends Error {
    constructor ({ error, details }) {
        super(WAMP_ERROR_MSG.WAMP_ABORT);
        this.name = 'AbortedError';
        this.code = 30;
        this.errorUri = error;
        this.details = details;
    }
}

export class WampError extends Error {
    constructor ({ error, details, argsList, argsDict }) {
        super(WAMP_ERROR_MSG.WAMP_GENERAL_ERROR);
        this.name = 'WampError';
        this.code = 31;
        this.errorUri = error;
        this.details = details;
        this.argsList = argsList;
        this.argsDict = argsDict;
    }
}

export class SubscribeError extends WampError {
    constructor ({ error, details, argsList, argsDict }) {
        super({ error, details, argsList, argsDict });
        this.name = 'SubscribeError';
        this.code = 32;
    }
}

export class UnsubscribeError extends WampError {
    constructor ({ error, details, argsList, argsDict }) {
        super({ error, details, argsList, argsDict });
        this.name = 'UnsubscribeError';
        this.code = 33;
    }
}

export class PublishError extends WampError {
    constructor ({ error, details, argsList, argsDict }) {
        super({ error, details, argsList, argsDict });
        this.name = 'PublishError';
        this.code = 34;
    }
}

export class RegisterError extends WampError {
    constructor ({ error, details, argsList, argsDict }) {
        super({ error, details, argsList, argsDict });
        this.name = 'RegisterError';
        this.code = 35;
    }
}

export class UnregisterError extends WampError {
    constructor ({ error, details, argsList, argsDict }) {
        super({ error, details, argsList, argsDict });
        this.name = 'UnregisterError';
        this.code = 36;
    }
}

export class CallError extends WampError {
    constructor ({ error, details, argsList, argsDict }) {
        super({ error, details, argsList, argsDict });
        this.name = 'CallError';
        this.code = 37;
    }
}

export class WebsocketError extends Error {
    constructor (error) {
        super(WAMP_ERROR_MSG.WEBSOCKET_ERROR);
        this.name = 'WebsocketError';
        this.code = 38;
        this.error = error;
    }
}
