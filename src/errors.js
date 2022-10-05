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
    constructor () {
        super(WAMP_ERROR_MSG.INVALID_PARAM);
        this.name = 'InvalidParamError';
        this.code = 4;
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
    }
}

export class ChallengeExceptionError extends Error {
    constructor () {
        super(WAMP_ERROR_MSG.CHALLENGE_EXCEPTION);
        this.name = 'ChallengeExceptionError';
        this.code = 24;
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
