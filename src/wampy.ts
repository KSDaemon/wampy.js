/**
 * Project: wampy.js
 *
 * https://github.com/KSDaemon/wampy.js
 *
 * A lightweight client-side implementation of
 * WAMP (The WebSocket Application Messaging Protocol v2)
 * https://wamp-proto.org
 *
 * Provides asynchronous RPC/PubSub over WebSocket.
 *
 * Copyright 2014 KSDaemon. Licensed under the MIT License.
 * See @license text at http://www.opensource.org/licenses/mit-license.php
 *
 */

import { E2EE_SERIALIZERS, SUCCESS, WAMP_ERROR_MSG, WAMP_MSG_SPEC, WAMP_CUSTOM_ATTR_REGEX } from './constants.js';
import * as Errors from './errors.js';
import { WebsocketError } from './errors.js';
import { getNewPromise, getWebSocket } from './utils.js';
import { JsonSerializer } from './serializers/json-serializer.js';
import type { Deferred } from './utils.js';
import type { Serializer } from './serializers/serializer.js';
import type {
    WampyOptions,
    WampyCache,
    WampyOpStatus,
    WampFeatures,
    SubscriptionCallbacksHash,
    RegistrationCallbacksHash,
    WampRequest,
    WampCall,
    TopicType,
    WampRole,
    Payload,
    PayloadWithArgsKwargs,
    PackPPTPayloadResult,
    UnpackPPTPayloadResult,
    EventCallback,
    RPCCallback,
    CallResult,
    InvocationResult,
    InvocationErrorData,
    SubscribeAdvancedOptions,
    PublishAdvancedOptions,
    CallAdvancedOptions,
    CancelAdvancedOptions,
    RegisterAdvancedOptions,
    ProgressiveCallSendDataOptions,
    ProgressiveCallReturn,
    SubscribeSuccessResult,
    UnsubscribeSuccessResult,
    PublishSuccessResult,
    RegisterSuccessResult,
    UnregisterSuccessResult,
    SubscribeRequestCallbacks,
    RegisterRequestCallbacks,
    ServerWampFeatures,
} from './types.js';

const jsonSerializer: Serializer = new JsonSerializer();

/**
 * WAMP Client Class
 */
class Wampy {

    /** Wampy version */
    version: string = 'v8.0.0';

    /** WS Url */
    private _url: string | null;

    /** WS protocols */
    private _protocols: string[];

    /** WAMP features, supported by Wampy */
    private readonly _wamp_features: WampFeatures;

    /** Internal cache for object lifetime */
    private _cache: WampyCache;

    /** WebSocket object */
    private _ws: WebSocket | null;

    /** Internal queue for websocket requests, for case of disconnect */
    private _wsQueue: (string | ArrayBuffer | Uint8Array | undefined)[];

    /** Internal queue for wamp requests */
    private _requests: Record<number, WampRequest>;

    /** Stored RPC */
    private _calls: Record<number, WampCall>;

    /** Stored Pub/Subs to access by ID */
    private readonly _subscriptionsById: Map<number, SubscriptionCallbacksHash>;

    /** Stored Pub/Subs to access by Key */
    private _subscriptionsByKey: Map<string, SubscriptionCallbacksHash>;

    /** Stored RPC Registrations */
    private _rpcRegs: Record<string | number, RegistrationCallbacksHash>;

    /** Stored RPC names */
    private _rpcNames: Set<string>;

    /** Options hash-table */
    private _options: Required<WampyOptions>;

    constructor ();
    constructor (url: string);
    constructor (options: WampyOptions);
    constructor (url: string, options: WampyOptions);
    constructor (url?: string | WampyOptions, options?: WampyOptions) {

        this._url = (typeof url === 'string') ? url : null;

        this._protocols = ['wamp.2.json'];

        this._wamp_features = {
            agent: 'Wampy.js ' + this.version,
            roles: {
                publisher : {
                    features: {
                        subscriber_blackwhite_listing: true,
                        publisher_exclusion          : true,
                        publisher_identification     : true,
                        payload_passthru_mode        : true
                    }
                },
                subscriber: {
                    features: {
                        pattern_based_subscription: true,
                        publication_trustlevels   : true,
                        publisher_identification  : true,
                        payload_passthru_mode     : true
                    }
                },
                caller    : {
                    features: {
                        caller_identification   : true,
                        progressive_call_results: true,
                        call_canceling          : true,
                        call_timeout            : true,
                        payload_passthru_mode   : true
                    }
                },
                callee    : {
                    features: {
                        caller_identification     : true,
                        call_trustlevels          : true,
                        pattern_based_registration: true,
                        shared_registration       : true,
                        payload_passthru_mode     : true

                    }
                }
            }
        };

        this._cache = {
            sessionId: null,
            reqId: 0,
            server_wamp_features: { roles: {} },
            isSayingGoodbye: false,
            opStatus: {
                code: 0,
                error: null,
                reqId: 0
            },
            timer: null,
            reconnectingAttempts: 0,
            connectPromise: null,
            closePromise: null
        };

        this._ws = null;
        this._wsQueue = [];
        this._requests = {};
        this._calls = {};
        this._subscriptionsById = new Map();
        this._subscriptionsByKey = new Map();
        this._rpcRegs = {};
        this._rpcNames = new Set();

        this._options = {
            debug: false,
            logger: null,
            autoReconnect: true,
            reconnectInterval: 2 * 1000,
            maxRetries: 25,
            realm: null,
            helloCustomDetails: null,
            uriValidation: 'strict',
            authid: null,
            authmethods: [],
            authextra: {},
            authPlugins: {},
            authMode: 'manual',
            onChallenge: null,
            onClose: null,
            onError: null,
            onReconnect: null,
            onReconnectSuccess: null,
            ws: null,
            additionalHeaders: null,
            wsRequestOptions: null,
            serializer: jsonSerializer,
            payloadSerializers: {
                json: jsonSerializer
            }
        };

        if (this._isPlainObject(options)) {
            this._options = { ...this._options, ...options as WampyOptions };
        } else if (this._isPlainObject(url)) {
            this._options = { ...this._options, ...url as WampyOptions };
        }
    }

    /* Internal utils methods */

    /** Internal logger */
    private _log (...args: unknown[]): void {
        if (!this._options.debug) { return; }

        if (this._options.logger) {
            return this._options.logger(args);
        }

        return console.log('[wampy]', args);
    }

    /** Get the new unique request id */
    private _getReqId (): number {
        return ++this._cache.reqId;
    }

    /** Check if input is an object literal */
    private _isPlainObject (input: unknown): input is Record<string, unknown> {
        const constructor = (input as Record<string, unknown>)?.constructor;
        const prototype = (constructor as { prototype?: unknown })?.prototype;

        return Object.prototype.toString.call(input) === '[object Object]'     // checks for primitives, null, Arrays, DOM, etc.
            && typeof constructor === 'function'                               // checks for modified constructors
            && Object.prototype.toString.call(prototype) === '[object Object]' // checks for modified prototypes
            && Object.hasOwnProperty.call(prototype, 'isPrototypeOf');         // checks for missing object-specific property
    }

    /** Set websocket protocol based on options */
    private _setWsProtocols (): void {
        this._protocols = ['wamp.2.' + this._options.serializer.protocol];
        // FIXME: Temporary commented out due to bug in Nexus
        // if (!(this._options.serializer instanceof JsonSerializer)) {
        //     this._protocols.unshift('wamp.2.' + this._options.serializer.protocol);
        // }
    }

    /** Fill instance operation status */
    private _fillOpStatusByError (err: Error & { code: number }): void {
        this._cache.opStatus = {
            code: err.code,
            error: err,
            reqId: 0
        };
    }

    /** Prerequisite checks for any wampy api call */
    private _preReqChecks (topicType: TopicType | null, role: WampRole): boolean {
        if (this._cache.sessionId && !this._cache.server_wamp_features.roles[role]) {
            const errorsByRole: Record<WampRole, Error & { code: number }> = {
                dealer: new Errors.NoDealerError(),
                broker: new Errors.NoBrokerError(),
            };

            this._fillOpStatusByError(errorsByRole[role]);
            return false;
        }

        if (topicType && !this._validateURI(topicType.topic, topicType.patternBased, topicType.allowWAMP)) {
            this._fillOpStatusByError(new Errors.UriError());
            return false;
        }

        return true;
    }

    /** Check for specified feature in a role of connected WAMP Router */
    private _checkRouterFeature (role: string, feature: string): boolean {
        if (!this._cache.server_wamp_features.roles[role].features[feature]) {
            this._fillOpStatusByError(new Errors.FeatureNotSupportedError(role, feature));
            return false;
        }

        return true;
    }

    /** Check for PPT mode options correctness */
    private _checkPPTOptions (role: string, options: Record<string, unknown>): boolean {
        if (!this._checkRouterFeature(role, 'payload_passthru_mode')) {
            this._fillOpStatusByError(new Errors.PPTNotSupportedError());
            return false;
        }

        if ((options.ppt_scheme as string).search(/^(wamp$|mqtt$|x_)/) < 0) {
            this._fillOpStatusByError(new Errors.PPTInvalidSchemeError());
            return false;
        }

        if (options.ppt_scheme === 'wamp' && !E2EE_SERIALIZERS.includes(options.ppt_serializer as string)) {
            this._fillOpStatusByError(new Errors.PPTSerializerInvalidError());
            return false;
        }

        return true;
    }

    /** Validate uri */
    private _validateURI (uri: string, isPatternBased: boolean, isWampAllowed: boolean): boolean {
        const isStrictValidation = this._options.uriValidation === 'strict';
        const isLooseValidation = this._options.uriValidation === 'loose';
        const isValidationTypeUnknown = !isStrictValidation && !isLooseValidation;

        if (isValidationTypeUnknown || (uri.startsWith('wamp.') && !isWampAllowed)) {
            return false;
        }

        let reBase: RegExp | undefined, rePattern: RegExp | undefined;
        if (isStrictValidation) {
            reBase = /^(\w+\.)*(\w+)$/;
            rePattern = /^(\w+\.{1,2})*(\w+)$/;
        } else if (isLooseValidation) {
            reBase = /^([^\s#.]+\.)*([^\s#.]+)$/;
            rePattern = /^([^\s#.]+\.{1,2})*([^\s#.]+)$/;
        }

        return (isPatternBased ? rePattern! : reBase!).test(uri);
    }

    /** Prepares PPT/E2EE payload for adding to WAMP message */
    private _packPPTPayload (payload: Payload, options: Record<string, unknown>): PackPPTPayloadResult {
        const payloadObj = payload as PayloadWithArgsKwargs;
        const isArgsListInvalid = payloadObj?.argsList && !Array.isArray(payloadObj.argsList);
        const isArgsDictInvalid = payloadObj?.argsDict && !this._isPlainObject(payloadObj.argsDict);

        if (isArgsListInvalid || isArgsDictInvalid) {
            const invalidParameter = isArgsListInvalid ? payloadObj.argsList : payloadObj.argsDict;
            this._fillOpStatusByError(new Errors.InvalidParamError(String(invalidParameter)));
            return { err: true, payloadItems: [] };
        }

        const isPayloadAnObject = this._isPlainObject(payload);
        const { argsList, argsDict } = payloadObj ?? {};
        let args: unknown[] | undefined, kwargs: Record<string, unknown> | undefined;

        if (isPayloadAnObject && !argsList && !argsDict) {
            kwargs = payload as Record<string, unknown>;
        } else if (isPayloadAnObject) {
            args = argsList;
            kwargs = argsDict;
        } else if (Array.isArray(payload)) {
            args = payload;
        } else {  // assume it's a single value
            args = [payload];
        }

        const payloadItems: unknown[] = [];

        if (!options.ppt_scheme) {
            if (args) {
                payloadItems.push(args);
            }
            if (kwargs) {
                if (!args) {
                    payloadItems.push([]);
                }
                payloadItems.push(kwargs);
            }
            return { err: false, payloadItems };
        }

        const pptPayload = { args, kwargs };
        let binPayload: unknown = pptPayload;

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (options.ppt_serializer && options.ppt_serializer !== 'native') {
            const pptSerializer = this._options.payloadSerializers[options.ppt_serializer as string];

            if (!pptSerializer) {
                this._fillOpStatusByError(new Errors.PPTSerializerInvalidError());
                return { err: true, payloadItems };
            }

            try {
                binPayload = pptSerializer.encode(pptPayload);
            } catch {
                this._fillOpStatusByError(new Errors.PPTSerializationError());
                return { err: true, payloadItems };
            }
        }

        // TODO: implement End-to-End Encryption
        // wamp scheme means Payload End-to-End Encryption
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
        // if (options.ppt_scheme === 'wamp') {
        //
        // }

        payloadItems.push([binPayload]);

        return { err: false, payloadItems };
    }

    /** Unpack PPT/E2EE payload to common */
    private _unpackPPTPayload (role: string, pptPayload: unknown, options: Record<string, unknown>): UnpackPPTPayloadResult {
        let decodedPayload: { args?: unknown[]; kwargs?: Record<string, unknown> };

        if (!this._checkPPTOptions(role, options)) {
            return { err: this._cache.opStatus.error || false };
        }

        // TODO: implement End-to-End Encryption
        // wamp scheme means Payload End-to-End Encryption
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
        // if (options.ppt_scheme === 'wamp') {
        //
        // }

        if (options.ppt_serializer && options.ppt_serializer !== 'native') {
            const pptSerializer = this._options.payloadSerializers[options.ppt_serializer as string];

            if (!pptSerializer) {
                return { err: new Errors.PPTSerializerInvalidError() };
            }

            try {
                decodedPayload = pptSerializer.decode(pptPayload as string | ArrayBuffer | Uint8Array) as { args?: unknown[]; kwargs?: Record<string, unknown> };
            } catch {
                return { err: new Errors.PPTSerializationError() };
            }
        } else {
            decodedPayload = pptPayload as { args?: unknown[]; kwargs?: Record<string, unknown> };
        }
        return { err: false, args: decodedPayload.args, kwargs: decodedPayload.kwargs };
    }

    /** Encode WAMP message */
    private _encode (msg: unknown[]): string | ArrayBuffer | Uint8Array | undefined {
        try {
            return this._options.serializer.encode(msg);
        } catch {
            this._hardClose('wamp.error.protocol_violation', 'Can not encode message', true);
        }
    }

    /** Decode WAMP message */
    private _decode (msg: unknown): unknown[] {
        try {
            return this._options.serializer.decode(msg as string | ArrayBuffer | Uint8Array) as unknown[];
        } catch {
            this._hardClose('wamp.error.protocol_violation', 'Can not decode received message');
            return [];
        }
    }

    /** Hard close of connection due to protocol violations */
    private _hardClose (errorUri: string, details: string, noSend: boolean = false): void {
        this._log(details);
        // Cleanup outgoing message queue
        this._wsQueue = [];

        if (!noSend) {
            this._send([WAMP_MSG_SPEC.ABORT, { message: details }, errorUri]);
        }

        const protocolViolationError = new Errors.ProtocolViolationError(errorUri, details);

        // In case we were just making first connection
        if (this._cache.connectPromise) {
            this._cache.connectPromise.onError(protocolViolationError);
            this._cache.connectPromise = null;
        }

        if (this._options.onError) {
            this._options.onError(protocolViolationError);
        }

        this._ws!.close();
    }

    /** Send encoded message to server */
    private _send (msg?: unknown[]): void {
        if (msg) {
            this._wsQueue.push(this._encode(msg));
        }

        if (this._ws && this._ws.readyState === 1 && this._cache.sessionId) {
            while (this._wsQueue.length > 0) {
                this._ws.send(this._wsQueue.shift() as string | ArrayBuffer);
            }
        }
    }

    /** Reject (fail) all ongoing promises on connection closing */
    private async _reject_ongoing_promises (error: Error): Promise<void> {
        const promises: (void | Promise<void>)[] = [];

        for (const call of Object.values(this._calls)) {
            if (call.onError) {
                promises.push(call.onError(error));
            }
        }
        for (const req of Object.values(this._requests)) {
            if (req.callbacks?.onError) {
                promises.push(req.callbacks.onError(error));
            }
        }

        await Promise.allSettled(promises);
        this._requests = {};
        this._calls = {};
    }

    /** Reset internal state and cache */
    private _resetState (): void {
        this._wsQueue = [];
        this._subscriptionsById.clear();
        this._subscriptionsByKey.clear();
        this._requests = {};
        this._calls = {};
        this._rpcRegs = {};
        this._rpcNames = new Set();

        // Just keep attrs that are have to be present
        this._cache = {
            reqId               : 0,
            reconnectingAttempts: 0,
            opStatus            : SUCCESS,
            closePromise        : null,
            connectPromise      : null,
        } as WampyCache;
    }

    /** Initialize internal websocket callbacks */
    private _initWsCallbacks (): void {
        this._ws!.onopen = () => this._wsOnOpen();
        this._ws!.onclose = async (event: CloseEvent) => this._wsOnClose(event);
        this._ws!.onmessage = (event: MessageEvent) => this._wsOnMessage(event);
        this._ws!.onerror = async (error: Event) => this._wsOnError(error);
    }

    /** Internal websocket on open callback */
    private _wsOnOpen (): void {
        const { helloCustomDetails, authmethods, authid, authextra, serializer, onError, realm } = this._options;
        const serverProtocol = this._ws!.protocol?.split('.')?.[2];
        const hasServerChosenOurPreferredProtocol = serverProtocol === serializer.protocol;

        this._log(`Websocket connected. Server has chosen protocol: "${serverProtocol}"`);

        if (!hasServerChosenOurPreferredProtocol) {
            if (serverProtocol === 'json') {
                this._options.serializer = new JsonSerializer();
            } else {
                const noSerializerAvailableError = new Errors.NoSerializerAvailableError();
                this._fillOpStatusByError(noSerializerAvailableError);

                if (this._cache.connectPromise) {
                    this._cache.connectPromise.onError(noSerializerAvailableError);
                    this._cache.connectPromise = null;
                }

                if (onError) {
                    onError(noSerializerAvailableError);
                }
            }
        }

        if (serializer.isBinary) {
            this._ws!.binaryType = 'arraybuffer';
        }

        const messageOptions = {
            ...helloCustomDetails,
            ...this._wamp_features,
            ...(authid ? { authid, authmethods, authextra } : {}),
        };
        const encodedMessage = this._encode([WAMP_MSG_SPEC.HELLO, realm, messageOptions]);

        if (encodedMessage) {
            // Sending directly 'cause it's a hello message and no sessionId check is needed
            this._ws!.send(encodedMessage as string | ArrayBuffer);
        }
    }

    /** Internal websocket on close callback */
    async _wsOnClose (event: CloseEvent): Promise<void> {
        this._log('websocket disconnected. Info: ', event);

        await this._reject_ongoing_promises(new WebsocketError('Connection closed'));

        // Automatic reconnection
        if ((this._cache.sessionId || this._cache.reconnectingAttempts) &&
            this._options.autoReconnect &&
            (this._options.maxRetries === 0 ||
             this._cache.reconnectingAttempts < this._options.maxRetries) &&
            !this._cache.isSayingGoodbye) {
            this._cache.sessionId = null;
            this._cache.timer = setTimeout(() => {
                this._wsReconnect();
            }, this._options.reconnectInterval);
        } else {
            // No reconnection needed or reached max retries count
            if (this._options.onClose) {
                this._options.onClose();
            }
            if (this._cache.closePromise) {
                this._cache.closePromise.onSuccess(undefined as never);
                this._cache.closePromise = null;
            }
            this._resetState();
            this._ws = null;
        }
    }

    /** Internal websocket on event callback */
    async _wsOnMessage (event: MessageEvent): Promise<void> {
        const data = this._decode(event.data);

        this._log('websocket message received: ', data);

        const messageType = data[0] as number;
        const messageHandlers: Record<number, () => void | Promise<void>> = {
            [WAMP_MSG_SPEC.WELCOME]:      () => this._onWelcomeMessage(data as [unknown, number, ServerWampFeatures]),
            [WAMP_MSG_SPEC.ABORT]:        () => this._onAbortMessage(data as [unknown, Record<string, unknown>, string]),
            [WAMP_MSG_SPEC.CHALLENGE]:    () => this._onChallengeMessage(data as [unknown, string, Record<string, unknown>]),
            [WAMP_MSG_SPEC.GOODBYE]:      () => this._onGoodbyeMessage(),
            [WAMP_MSG_SPEC.ERROR]:        () => this._onErrorMessage(data as [unknown, number, number, Record<string, unknown>, string, unknown[]?, Record<string, unknown>?]),
            [WAMP_MSG_SPEC.SUBSCRIBED]:   () => this._onSubscribedMessage(data as [unknown, number, number]),
            [WAMP_MSG_SPEC.UNSUBSCRIBED]: () => this._onUnsubscribedMessage(data as [unknown, number]),
            [WAMP_MSG_SPEC.PUBLISHED]:    () => this._onPublishedMessage(data as [unknown, number, number]),
            [WAMP_MSG_SPEC.EVENT]:        () => this._onEventMessage(data as [unknown, number, number, Record<string, unknown>, unknown[]?, Record<string, unknown>?]),
            [WAMP_MSG_SPEC.RESULT]:       () => this._onResultMessage(data as [unknown, number, Record<string, unknown>, unknown[]?, Record<string, unknown>?]),
            // [WAMP_MSG_SPEC.REGISTER]:     () => {},
            [WAMP_MSG_SPEC.REGISTERED]:   () => this._onRegisteredMessage(data as [unknown, number, number]),
            // [WAMP_MSG_SPEC.UNREGISTER]:  () => {},
            [WAMP_MSG_SPEC.UNREGISTERED]: () => this._onUnregisteredMessage(data as [unknown, number]),
            [WAMP_MSG_SPEC.INVOCATION]:   () => this._onInvocationMessage(data as [unknown, number, number, Record<string, unknown>, unknown[]?, Record<string, unknown>?]),
            // [WAMP_MSG_SPEC.INTERRUPT]:    () => {},
            // [WAMP_MSG_SPEC.YIELD]:        () => {},
        };
        const handler = messageHandlers[messageType];
        const errorURI = 'wamp.error.protocol_violation';

        if (!handler) {
            return this._hardClose(errorURI, `Received non-compliant WAMP message: "${messageType}"`);
        }

        const needNoSession = ([WAMP_MSG_SPEC.WELCOME, WAMP_MSG_SPEC.CHALLENGE] as number[]).includes(messageType);
        const needValidSession = !needNoSession && messageType !== WAMP_MSG_SPEC.ABORT;

        if (needNoSession && this._cache.sessionId) {
            return this._hardClose(errorURI, `Received message "${messageType}" after session was established`);
        }

        if (needValidSession && !this._cache.sessionId) {
            return this._hardClose(errorURI, `Received message "${messageType}" before session was established`);
        }

        if (this._isRequestIdValid(data)) {
            await handler();
        }
    }

    /** Validates the requestId for message types that need this kind of validation */
    _isRequestIdValid ([messageType, requestId]: unknown[]): boolean {
        const isRequestIdValidationNeeded = ([
            WAMP_MSG_SPEC.SUBSCRIBED,
            WAMP_MSG_SPEC.UNSUBSCRIBED,
            WAMP_MSG_SPEC.PUBLISHED,
            WAMP_MSG_SPEC.RESULT,
            WAMP_MSG_SPEC.REGISTERED,
            WAMP_MSG_SPEC.UNREGISTERED
        ] as number[]).includes(messageType as number);

        if (!isRequestIdValidationNeeded) {
            return true;
        }

        if (messageType === WAMP_MSG_SPEC.RESULT && this._calls[requestId as number]) {
            return true;
        }

        if (this._requests[requestId as number]) {
            return true;
        }

        return false;
    }

    /**
     * Handles websocket welcome message event
     * WAMP SPEC: [WELCOME, Session|id, Details|dict]
     */
    async _onWelcomeMessage ([, sessionId, details]: [unknown, number, ServerWampFeatures]): Promise<void> {
        this._cache.sessionId = sessionId;
        this._cache.server_wamp_features = details;

        if (this._cache.reconnectingAttempts) {
            this._cache.reconnectingAttempts = 0;

            if (this._options.onReconnectSuccess) {
                await this._options.onReconnectSuccess(details as unknown as Record<string, unknown>);
            }

            // Renew all previous state
            await Promise.allSettled([this._renewSubscriptions(), this._renewRegistrations()]);
        } else {
            // Fire onConnect event on real connection to WAMP server
            this._cache.connectPromise!.onSuccess(details as unknown as Record<string, unknown>);
            this._cache.connectPromise = null;
        }

        // Send local queue if there is something out there
        this._send();
    }

    /**
     * Handles websocket abort message event
     * WAMP SPEC: [ABORT, Details|dict, Error|uri]
     */
    async _onAbortMessage ([, details, error]: [unknown, Record<string, unknown>, string]): Promise<void> {
        const err = new Errors.AbortError({ error, details });
        if (this._cache.connectPromise) {
            this._cache.connectPromise.onError(err);
            this._cache.connectPromise = null;
        }
        if (this._options.onError) {
            await this._options.onError(err);
        }
        this._ws!.close();
    }

    /**
     * Handles websocket challenge message event
     * WAMP SPEC: [CHALLENGE, AuthMethod|string, Extra|dict]
     */
    async _onChallengeMessage ([, authMethod, extra]: [unknown, string, Record<string, unknown>]): Promise<void> {
        let promise: Promise<string>;

        const { authid, authMode, onChallenge, onError, authPlugins } = this._options;

        if (authid && authMode === 'manual' && typeof onChallenge === 'function') {
            promise = new Promise((resolve) => {
                resolve(onChallenge(authMethod, extra));
            });
        } else if (authid && authMode === 'auto' && typeof authPlugins[authMethod] === 'function') {
            promise = new Promise((resolve) => {
                resolve(authPlugins[authMethod](authMethod, extra));
            });
        } else {
            const noCRACallbackOrIdError = new Errors.NoCRACallbackOrIdError();

            this._fillOpStatusByError(noCRACallbackOrIdError);
            this._ws!.send(this._encode([
                WAMP_MSG_SPEC.ABORT,
                { message: noCRACallbackOrIdError.message },
                'wamp.error.cannot_authenticate'
            ]) as string | ArrayBuffer);

            if (onError) {
                await onError(noCRACallbackOrIdError);
            }

            return this._ws!.close() as unknown as void;
        }

        try {
            const key = await promise;

            // Sending directly 'cause it's a challenge msg and no sessionId check is needed
            this._ws!.send(this._encode([WAMP_MSG_SPEC.AUTHENTICATE, key, {}]) as string | ArrayBuffer);
        } catch {
            const challengeExceptionError = new Errors.ChallengeExceptionError();

            this._fillOpStatusByError(challengeExceptionError);
            this._ws!.send(this._encode([
                WAMP_MSG_SPEC.ABORT,
                { message: challengeExceptionError.message },
                'wamp.error.cannot_authenticate'
            ]) as string | ArrayBuffer);

            if (onError) {
                await onError(challengeExceptionError);
            }

            this._ws!.close();
        }
    }

    /**
     * Handles websocket goodbye message event
     * WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
     */
    async _onGoodbyeMessage (): Promise<void> {
        if (!this._cache.isSayingGoodbye) {    // get goodbye, initiated by server
            this._cache.isSayingGoodbye = true;
            this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.goodbye_and_out']);
        }
        this._cache.sessionId = null;
        this._ws!.close();
    }

    /**
     * Handles websocket error message event
     * WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict,
     *             Error|uri, (Arguments|list, ArgumentsKw|dict)]
     */
    async _onErrorMessage ([, requestType, requestId, details, error, argsList, argsDict]: [unknown, number, number, Record<string, unknown>, string, unknown[]?, Record<string, unknown>?]): Promise<void> {
        const errorOptions = { error, details, argsList, argsDict };
        const errorsByRequestType: Record<number, Error> = {
            [WAMP_MSG_SPEC.SUBSCRIBE]: new Errors.SubscribeError(errorOptions),
            [WAMP_MSG_SPEC.UNSUBSCRIBE]: new Errors.UnsubscribeError(errorOptions),
            [WAMP_MSG_SPEC.PUBLISH]: new Errors.PublishError(errorOptions),
            [WAMP_MSG_SPEC.REGISTER]: new Errors.RegisterError(errorOptions),
            [WAMP_MSG_SPEC.UNREGISTER]: new Errors.UnregisterError(errorOptions),
            // [WAMP_MSG_SPEC.INVOCATION]:
            [WAMP_MSG_SPEC.CALL]: new Errors.CallError(errorOptions),
        };
        const currentError = errorsByRequestType[requestType];

        if (!currentError) {
            return this._hardClose('wamp.error.protocol_violation', 'Received invalid ERROR message');
        }

        if (requestType === WAMP_MSG_SPEC.CALL) {
            const call = this._calls[requestId];
            if (call?.onError) {
                await call.onError(currentError);
            }
            delete this._calls[requestId];
        } else {
            const req = this._requests[requestId];
            if (req?.callbacks?.onError) {
                await req.callbacks.onError(currentError);
            }
            delete this._requests[requestId];
        }
    }

    /**
     * Handles websocket subscribed message event
     * WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
     */
    async _onSubscribedMessage ([, requestId, subscriptionId]: [unknown, number, number]): Promise<void> {
        const { topic, advancedOptions, callbacks } = this._requests[requestId];
        const reqCallbacks = callbacks as SubscribeRequestCallbacks;
        const subscription: SubscriptionCallbacksHash = {
            id: subscriptionId,
            topic,
            advancedOptions,
            callbacks: [reqCallbacks.onEvent]
        };
        const subscriptionKey = this._getSubscriptionKey(topic, advancedOptions);

        this._subscriptionsById.set(subscriptionId, subscription);
        this._subscriptionsByKey.set(subscriptionKey, subscription);

        if (reqCallbacks.onSuccess) {
            await reqCallbacks.onSuccess({ topic, requestId, subscriptionId, subscriptionKey } as unknown as SubscribeSuccessResult);
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket unsubscribed message event
     * WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
     */
    async _onUnsubscribedMessage ([, requestId]: [unknown, number]): Promise<void> {
        const { topic, advancedOptions, callbacks } = this._requests[requestId];
        const subscriptionKey = this._getSubscriptionKey(topic, advancedOptions);
        const subscriptionId = this._subscriptionsByKey.get(subscriptionKey)!.id;
        this._subscriptionsByKey.delete(subscriptionKey);
        this._subscriptionsById.delete(subscriptionId);

        if (callbacks.onSuccess) {
            await (callbacks.onSuccess as (v: unknown) => void)({ topic, requestId });
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket published message event
     * WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
     */
    async _onPublishedMessage ([, requestId, publicationId]: [unknown, number, number]): Promise<void> {
        const { topic, callbacks } = this._requests[requestId];

        if (callbacks?.onSuccess) {
            await (callbacks.onSuccess as (v: unknown) => void)({ topic, requestId, publicationId });
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket event message event
     * WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id,
     *            Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]
     */
    async _onEventMessage ([, subscriptionId, publicationId, details, argsList, argsDict]: [unknown, number, number, Record<string, unknown>, unknown[]?, Record<string, unknown>?]): Promise<void> {
        const subscription = this._subscriptionsById.get(subscriptionId);

        if (!subscription) {
            return;
        }

        let args = argsList;
        let kwargs = argsDict;

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (details.ppt_scheme) {
            const pptPayload = argsList![0];
            const decodedPayload = this._unpackPPTPayload('broker', pptPayload, details as Record<string, unknown>);

            if (decodedPayload.err) {
                // Since it is async publication, and no link to
                // original publication - as it was already published
                // we can not reply with error, only log it.
                // Although the router should handle it
                return this._log((decodedPayload.err as Error).message);
            }

            args = decodedPayload.args;
            kwargs = decodedPayload.kwargs;
        }

        const callbackOptions = { details: details as Record<string, unknown>, argsList: args, argsDict: kwargs };
        const callbackPromises = subscription.callbacks.map((c) => c(callbackOptions));

        await Promise.all(callbackPromises);
    }

    /**
     * Handles websocket result message event
     * WAMP SPEC: [RESULT, CALL.Request|id, Details|dict,
     *             YIELD.Arguments|list, YIELD.ArgumentsKw|dict]
     */
    async _onResultMessage ([, requestId, details, argsList, argsDict]: [unknown, number, Record<string, unknown>, unknown[]?, Record<string, unknown>?]): Promise<void> {
        let args = argsList;
        let kwargs = argsDict;

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (details.ppt_scheme) {
            const pptPayload = argsList![0];
            const decodedPayload = this._unpackPPTPayload('dealer', pptPayload, details as Record<string, unknown>);

            if (decodedPayload.err) {
                this._log((decodedPayload.err as Error).message);
                this._cache.opStatus = decodedPayload.err as unknown as WampyOpStatus;
                await this._calls[requestId].onError(new Errors.CallError({
                    details: details as Record<string, unknown>,
                    error     : 'wamp.error.invocation_exception',
                    argsList  : [(decodedPayload.err as Error).message],
                    argsDict  : undefined
                }));
                delete this._calls[requestId];

                return;
            }

            args = decodedPayload.args;
            kwargs = decodedPayload.kwargs;
        }

        const callbackOptions: CallResult = { details: details as Record<string, unknown>, argsList: args, argsDict: kwargs };

        if (details.progress) {
            await this._calls[requestId].onProgress!(callbackOptions);
        } else {
            // We received final result (progressive or not)
            await this._calls[requestId].onSuccess(callbackOptions);
            delete this._calls[requestId];
        }
    }

    /**
     * Handles websocket registered message event
     * WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
     */
    async _onRegisteredMessage ([, requestId, registrationId]: [unknown, number, number]): Promise<void> {
        const { topic, callbacks, options } = this._requests[requestId];
        const reqCallbacks = callbacks as RegisterRequestCallbacks;

        this._rpcRegs[registrationId] = { id: registrationId, callbacks: [reqCallbacks.rpc], options };
        this._rpcRegs[topic] = this._rpcRegs[registrationId];
        this._rpcNames.add(topic);

        if (reqCallbacks?.onSuccess) {
            await reqCallbacks.onSuccess({ topic, requestId, registrationId } as unknown as RegisterSuccessResult);
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket unregistered message event
     * WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
     */
    async _onUnregisteredMessage ([, requestId]: [unknown, number]): Promise<void> {
        const { topic, callbacks } = this._requests[requestId];

        delete this._rpcRegs[this._rpcRegs[topic].id];
        delete this._rpcRegs[topic];

        if (this._rpcNames.has(topic)) {
            this._rpcNames.delete(topic);
        }

        if (callbacks?.onSuccess) {
            await (callbacks.onSuccess as (v: unknown) => void)({ topic, requestId });
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket invocation message event
     * WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id, Details|dict,
     *             CALL.Arguments|list, CALL.ArgumentsKw|dict]
     */
    async _onInvocationMessage ([, requestId, registrationId, details, argsList, argsDict]: [unknown, number, number, Record<string, unknown>, unknown[]?, Record<string, unknown>?]): Promise<void> {
        const self = this;
        const handleInvocationError = ({ error, details, argsList, argsDict }: InvocationErrorData): void => {
            const message: unknown[] = [
                WAMP_MSG_SPEC.ERROR,
                WAMP_MSG_SPEC.INVOCATION,
                requestId,
                details || {},
                error || 'wamp.error.invocation_exception',
            ];

            if (Array.isArray(argsList)) {
                message.push(argsList);
            }

            if (self._isPlainObject(argsDict)) {
                if (!Array.isArray(argsList)) {
                    message.push([]);
                }
                message.push(argsDict);
            }

            self._send(message);
        };

        if (!this._rpcRegs[registrationId]) {
            this._log(WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION);
            return handleInvocationError({ error: 'wamp.error.no_such_procedure' });
        }

        let args = argsList;
        let kwargs = argsDict;

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (details?.ppt_scheme) {
            const pptPayload = argsList![0];
            const decodedPayload = this._unpackPPTPayload('dealer', pptPayload, details as Record<string, unknown>);

            // This case should not happen at all, but for safety
            if (decodedPayload.err) {
                this._log((decodedPayload.err as Error).message);

                if (decodedPayload.err instanceof Errors.PPTNotSupportedError) {
                    // This case should not happen at all, but for safety
                    return this._hardClose('wamp.error.protocol_violation',
                        'Received INVOCATION in PPT Mode, while Dealer didn\'t announce it');
                }

                return handleInvocationError({
                    details: details as Record<string, unknown>,
                    error: 'wamp.error.invocation_exception',
                    argsList: [(decodedPayload.err as Error).message],
                });
            }

            args = decodedPayload.args;
            kwargs = decodedPayload.kwargs;
        }

        const handleInvocationResult = (result: InvocationResult | null | void): void => {
            const options = result?.options || {};
            const { ppt_scheme, ppt_serializer, ppt_cipher, ppt_keyid } = options;

            // Check and handle Payload PassThru Mode
            // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
            if (ppt_scheme && !this._checkPPTOptions('dealer', options as Record<string, unknown>)) {
                if (this._cache.opStatus.error instanceof Errors.PPTNotSupportedError) {
                    // This case should not happen at all, but for safety
                    return this._hardClose('wamp.error.protocol_violation',
                        'Trying to send YIELD in PPT Mode, while Dealer didn\'t announce it');
                }

                return handleInvocationError({
                    details : options as Record<string, unknown>,
                    error   : 'wamp.error.invalid_option',
                    argsList: [this._cache.opStatus.error!.message],
                });
            }

            const { err, payloadItems } = result ? this._packPPTPayload(result as unknown as Payload, options as Record<string, unknown>) : {} as Partial<PackPPTPayloadResult>;

            if (err) {
                return handleInvocationError({
                    details : options as Record<string, unknown>,
                    error   : 'wamp.error.invocation_exception',
                    argsList: [this._cache.opStatus.error!.message],
                });
            }

            const messageOptions: Record<string, unknown> = {
                ...options,
                ...(ppt_scheme ? { ppt_scheme } : {}),
                ...(ppt_serializer ? { ppt_serializer } : {}),
                ...(ppt_cipher ? { ppt_cipher } : {}),
                ...(ppt_keyid ? { ppt_keyid } : {}),
                ...this._extractCustomOptions(options as Record<string, unknown>)
            };

            // WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, Arguments|list, ArgumentsKw|dict]
            self._send([WAMP_MSG_SPEC.YIELD, requestId, messageOptions, ...(payloadItems || [])]);
        };

        try {
            const result = await this._rpcRegs[registrationId].callbacks[0]({
                details: details as Record<string, unknown>,
                argsList      : args,
                argsDict      : kwargs,
                result_handler: handleInvocationResult,
                error_handler : handleInvocationError
            });
            handleInvocationResult(result);
        } catch (e) {
            handleInvocationError(e as InvocationErrorData);
        }
    }

    /** Internal websocket on error callback */
    async _wsOnError (error: Event): Promise<void> {
        this._log('websocket error');
        const websocketError = new Errors.WebsocketError(error);

        await this._reject_ongoing_promises(websocketError);

        if (this._cache.connectPromise) {
            this._cache.connectPromise.onError(websocketError);
            this._cache.connectPromise = null;
        }

        if (this._options.onError) {
            this._options.onError(websocketError);
        }
    }

    /** Reconnect to server in case of websocket error */
    _wsReconnect (): void {
        this._log('websocket reconnecting...');

        if (this._options.onReconnect) {
            this._options.onReconnect();
        }

        this._cache.reconnectingAttempts++;
        this._ws = getWebSocket({
            url: this._url!,
            protocols: this._protocols,
            options: this._options as Record<string, unknown>
        });
        this._initWsCallbacks();
    }

    /** Resubscribe to topics in case of communication error */
    async _renewSubscriptions (): Promise<void> {
        let i: number;
        const subs = new Map(this._subscriptionsById);

        this._subscriptionsById.clear();
        this._subscriptionsByKey.clear();

        for (const sub of subs.values()) {
            i = sub.callbacks.length;
            while (i--) {
                try {
                    await this.subscribe(sub.topic, sub.callbacks[i], sub.advancedOptions);
                } catch (err) {
                    this._log(`cannot resubscribe to topic: ${sub.topic}`, err);

                    if (this._options.onError) {
                        this._options.onError(err as Error);
                    }
                }
            }
        }
    }

    /** ReRegister RPCs in case of communication error */
    async _renewRegistrations (): Promise<void> {
        const rpcs = this._rpcRegs,
            rn = this._rpcNames;

        this._rpcRegs = {};
        this._rpcNames = new Set();

        for (const rpcName of rn) {
            try {
                await this.register(rpcName, rpcs[rpcName].callbacks[0], rpcs[rpcName].options);
            } catch (err) {
                this._log(`cannot renew registration of rpc: ${rpcName}`, err);

                if (this._options.onError) {
                    this._options.onError(err as Error);
                }
            }
        }
    }

    /**
     * Generate a unique key for combination of topic and options
     *
     * This is needed to allow subscriptions to the same topic URI but with different options
     */
    _getSubscriptionKey (topic: string, options?: SubscribeAdvancedOptions): string {
        return `${topic}${options ? `-${JSON.stringify(options)}` : ''}`;
    }

    /*************************************************************************
     * Wampy public API
     *************************************************************************/

    /**
     * @deprecated since version 7.0.1
     *
     * Get or set Wampy options
     *
     * To get options - call without parameters
     * To set options - pass hash-table with options values
     */
    options (newOptions?: WampyOptions): Required<WampyOptions> | Wampy | undefined {
        console.warn('Wampy.options() is deprecated, please use Wampy.getOptions() or Wampy.setOptions() instead');

        if ((newOptions) === undefined) {
            return this._options;
        } else if (this._isPlainObject(newOptions)) {
            this._options = { ...this._options, ...newOptions as WampyOptions };
            return this;
        }
    }

    /** Wampy options getter */
    getOptions (): Required<WampyOptions> {
        return this._options;
    }

    /** Wampy options setter */
    setOptions (newOptions: WampyOptions): Wampy | undefined {
        if (this._isPlainObject(newOptions)) {
            this._options = { ...this._options, ...newOptions as WampyOptions };
            return this;
        }
    }

    /**
     * Get the status of last operation
     *
     * Returns an object with 3 fields: code, error, reqId
     *      code: 0 - if operation was successful
     *      code > 0 - if error occurred
     *      error: error instance containing details
     *      reqId: last successfully sent request ID
     */
    getOpStatus (): WampyOpStatus {
        return this._cache.opStatus;
    }

    /** Get the WAMP Session ID */
    getSessionId (): number | null {
        return this._cache.sessionId;
    }

    /** Connect to server */
    async connect (url?: string): Promise<Record<string, unknown>> {
        if (url) {
            this._url = url;
        }

        if (!this._options.realm) {
            const noRealmError = new Errors.NoRealmError();
            this._fillOpStatusByError(noRealmError);
            throw noRealmError;
        }

        const numberOfAuthOptions = (this._options.authid ? 1 : 0) +
                ((Array.isArray(this._options.authmethods) && this._options.authmethods.length > 0) ? 1 : 0) +
                (typeof this._options.onChallenge === 'function' ||
                 Object.keys(this._options.authPlugins).length > 0 ? 1 : 0);

        if (numberOfAuthOptions > 0 && numberOfAuthOptions < 3) {
            const noCRACallbackOrIdError = new Errors.NoCRACallbackOrIdError();
            this._fillOpStatusByError(noCRACallbackOrIdError);
            throw noCRACallbackOrIdError;
        }

        this._setWsProtocols();
        this._ws = getWebSocket({
            url: this._url!,
            protocols: this._protocols,
            options: this._options as Record<string, unknown>
        });

        if (!this._ws) {
            const noWsOrUrlError = new Errors.NoWsOrUrlError();
            this._fillOpStatusByError(noWsOrUrlError);
            throw noWsOrUrlError;
        }

        this._initWsCallbacks();

        const defer = getNewPromise<Record<string, unknown>>();
        this._cache.connectPromise = defer;
        return defer.promise;
    }

    /** Disconnect from server */
    async disconnect (): Promise<unknown> {
        if (this._cache.sessionId) {
            const defer = getNewPromise<void>();
            this._cache.opStatus = { ...SUCCESS, reqId: 0 };
            this._cache.closePromise = defer;
            // need to send goodbye message to server
            this._cache.isSayingGoodbye = true;
            this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.system_shutdown']);

            return defer.promise;

        } else if (this._ws) {
            this._ws.close();
        }

        return true;
    }

    /** Abort WAMP session establishment */
    abort (): Wampy {

        if (!this._cache.sessionId && this._ws!.readyState === 1) {
            this._send([WAMP_MSG_SPEC.ABORT, {}, 'wamp.error.abort']);
            this._cache.sessionId = null;
        }

        this._ws!.close();
        this._cache.opStatus = { ...SUCCESS, reqId: 0 };

        return this;
    }

    /** Subscribe to a topic on a broker */
    async subscribe (topic: string, onEvent: EventCallback, advancedOptions?: SubscribeAdvancedOptions): Promise<SubscribeSuccessResult> {
        const isAdvancedOptionsAnObject = this._isPlainObject(advancedOptions);

        if (!isAdvancedOptionsAnObject && ((advancedOptions) !== undefined)) {
            const invalidParamError = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        const { match, get_retained } = advancedOptions || {};
        let patternBased = false;
        if (match) {
            if (!['exact', 'prefix', 'wildcard'].includes(match)) {
                const invalidParamError = new Errors.InvalidParamError('match');
                this._fillOpStatusByError(invalidParamError);
                throw invalidParamError;
            }

            patternBased = match !== 'exact';
        }

        if (get_retained && typeof get_retained !== 'boolean') {
            const invalidParamError = new Errors.InvalidParamError('get_retained');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        if (!this._preReqChecks({ topic, patternBased, allowWAMP: true }, 'broker')) {
            throw this._cache.opStatus.error;
        }

        if (typeof onEvent !== 'function') {
            const noCallbackError = new Errors.NoCallbackError();
            this._fillOpStatusByError(noCallbackError);
            throw noCallbackError;
        }

        const subscriptionKey = this._getSubscriptionKey(topic, advancedOptions);
        const subscription = this._subscriptionsByKey.get(subscriptionKey);

        if (subscription && subscription.callbacks.length > 0) {
            if (!subscription.callbacks.includes(onEvent)) {
                subscription.callbacks.push(onEvent);
            }

            return { topic, requestId: 0, subscriptionId: subscription.id, subscriptionKey };
        }

        const reqId = this._getReqId();
        const callbacks = getNewPromise<SubscribeSuccessResult>() as SubscribeRequestCallbacks;

        callbacks.onEvent = onEvent;
        this._requests[reqId] = { topic, callbacks, advancedOptions };

        // WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
        const options = { match, get_retained, ...this._extractCustomOptions(advancedOptions) };
        this._send([WAMP_MSG_SPEC.SUBSCRIBE, reqId, options, topic]);
        this._cache.opStatus = { ...SUCCESS, reqId: reqId || 0 };

        return callbacks.promise;
    }

    /** Unsubscribe from topic */
    async unsubscribe (subscriptionIdOrKey: number | string, onEvent?: EventCallback): Promise<UnsubscribeSuccessResult | true> {
        if (!this._preReqChecks(null, 'broker')) {
            throw this._cache.opStatus.error;
        }

        const subscription = this._subscriptionsById.get(subscriptionIdOrKey as number) ||
            this._subscriptionsByKey.get(subscriptionIdOrKey as string);

        if (!subscription) {
            const nonExistUnsubscribeError = new Errors.NonExistUnsubscribeError();
            this._fillOpStatusByError(nonExistUnsubscribeError);
            throw nonExistUnsubscribeError;
        }

        subscription.callbacks = typeof onEvent === 'function'
            ? subscription.callbacks.filter((callback) => callback !== onEvent)
            : [];

        const isThereOtherCallbackForThisTopic = subscription.callbacks.length > 0;

        if (isThereOtherCallbackForThisTopic) {
            this._cache.opStatus = { ...SUCCESS, reqId: 0 };
            return true;
        }

        const reqId = this._getReqId();

        this._requests[reqId] = { topic: subscription.topic, callbacks: getNewPromise<UnsubscribeSuccessResult>() as unknown as Deferred };

        // WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]
        this._send([WAMP_MSG_SPEC.UNSUBSCRIBE, reqId, subscription.id]);
        this._cache.opStatus = { ...SUCCESS, reqId: reqId };

        return this._requests[reqId].callbacks.promise as Promise<UnsubscribeSuccessResult>;
    }

    /** Publish an event to the topic */
    async publish (topic: string, payload?: Payload, advancedOptions?: PublishAdvancedOptions): Promise<PublishSuccessResult> {
        if (!this._preReqChecks({ topic, patternBased: false, allowWAMP: false }, 'broker')) {
            throw this._cache.opStatus.error;
        }

        const isAdvancedOptionsAnObject = this._isPlainObject(advancedOptions);

        if (advancedOptions && !isAdvancedOptionsAnObject) {
            const error = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(error);
            throw error;
        }

        let messageOptions: Record<string, unknown> = {};
        const _optionsConvertHelper = (option: string, sourceType: string): boolean => {
            if ((advancedOptions as Record<string, unknown>)[option]) {
                if (Array.isArray((advancedOptions as Record<string, unknown>)[option]) && ((advancedOptions as Record<string, unknown>)[option] as unknown[]).length > 0) {
                    messageOptions[option] = (advancedOptions as Record<string, unknown>)[option];
                } else if (typeof (advancedOptions as Record<string, unknown>)[option] === sourceType) {
                    messageOptions[option] = [(advancedOptions as Record<string, unknown>)[option]];
                } else {
                    return false;
                }
            }

            return true;
        };

        if (isAdvancedOptionsAnObject && (
            !_optionsConvertHelper('exclude', 'number') ||
            !_optionsConvertHelper('exclude_authid', 'string') ||
            !_optionsConvertHelper('exclude_authrole', 'string') ||
            !_optionsConvertHelper('eligible', 'number') ||
            !_optionsConvertHelper('eligible_authid', 'string') ||
            !_optionsConvertHelper('eligible_authrole', 'string')
        )) {
            const invalidParamError = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        const { ppt_scheme, ppt_serializer, ppt_cipher, ppt_keyid, exclude_me, disclose_me, retain } = advancedOptions || {} as PublishAdvancedOptions;

        if (retain && typeof retain !== 'boolean') {
            const invalidParamError = new Errors.InvalidParamError('retain');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (ppt_scheme && !this._checkPPTOptions('broker', advancedOptions as Record<string, unknown>)) {
            throw this._cache.opStatus.error;
        }

        messageOptions = {
            acknowledge: true,
            ...messageOptions,
            ...(ppt_scheme ? { ppt_scheme } : {}),
            ...(ppt_scheme ? { ppt_scheme } : {}),
            ...(ppt_serializer ? { ppt_serializer } : {}),
            ...(ppt_cipher ? { ppt_cipher } : {}),
            ...(ppt_keyid ? { ppt_keyid } : {}),
            ...(exclude_me ? { exclude_me } : {}),
            ...(disclose_me ? { disclose_me } : {}),
            ...this._extractCustomOptions(advancedOptions)
        };

        const { err, payloadItems } = payload ? this._packPPTPayload(payload, messageOptions) : {} as Partial<PackPPTPayloadResult>;
        const reqId = this._getReqId();

        if (err) {
            throw this._cache.opStatus.error;
        }

        this._requests[reqId] = { topic, callbacks: getNewPromise<PublishSuccessResult>() as unknown as Deferred };
        this._cache.opStatus = { ...SUCCESS, reqId };
        this._send([WAMP_MSG_SPEC.PUBLISH, reqId, messageOptions, topic, ...(payloadItems || [])]);

        return this._requests[reqId].callbacks.promise as Promise<PublishSuccessResult>;
    }

    /** Extract custom options from advanced options as per WAMP spec 3.1 */
    _extractCustomOptions(advancedOptions?: Record<string, unknown>): Record<string, unknown> {
        const customOptions: Record<string, unknown> = {};
        for (const key in advancedOptions || {}) {
            if (WAMP_CUSTOM_ATTR_REGEX.test(key)) {
                customOptions[key] = advancedOptions![key];
            }
        }
        return customOptions;
    }

    /** Process CALL advanced options and transform them for the WAMP CALL message Options */
    _getCallMessageOptionsFromAdvancedOptions(advancedOptions?: CallAdvancedOptions): Record<string, unknown> {
        const {
            timeout,
            progress,
            progress_callback,
            disclose_me,
            ppt_scheme,
            ppt_serializer,
            ppt_cipher,
            ppt_keyid,
            ...rest
        } = advancedOptions || {} as CallAdvancedOptions;

        const result: Record<string, unknown> = {};

        if (progress_callback) {result.receive_progress = true;}
        if (progress) {result.progress = true;}
        if (disclose_me) {result.disclose_me = true;}
        if (timeout) {result.timeout = timeout;}
        if (ppt_scheme) {result.ppt_scheme = ppt_scheme;}
        if (ppt_serializer) {result.ppt_serializer = ppt_serializer;}
        if (ppt_cipher) {result.ppt_cipher = ppt_cipher;}
        if (ppt_keyid) {result.ppt_keyid = ppt_keyid;}

        // Extract custom options (starting with underscore) as per WAMP spec 3.1
        return { ...result, ...this._extractCustomOptions(rest) };
    }

    /** Remote Procedure Call Internal Implementation */
    _callInternal(topic: string, payload?: Payload, advancedOptions?: CallAdvancedOptions): number {
        if (!this._preReqChecks({ topic, patternBased: false, allowWAMP: true }, 'dealer')) {
            throw this._cache.opStatus.error;
        }

        if (advancedOptions && !this._isPlainObject(advancedOptions)) {
            const invalidParamError = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        const { timeout, progress_callback, ppt_scheme } = advancedOptions || {} as CallAdvancedOptions;
        const isTimeoutInvalid = (timeout && typeof timeout !== 'number');
        const isProgressCallbackInvalid = (progress_callback && typeof progress_callback !== 'function');

        if (isTimeoutInvalid || isProgressCallbackInvalid) {
            const paramName = isTimeoutInvalid ? 'timeout' : 'progress_callback';
            const invalidParamError = new Errors.InvalidParamError(paramName);
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (ppt_scheme && !this._checkPPTOptions('dealer', advancedOptions as Record<string, unknown>)) {
            throw this._cache.opStatus.error;
        }

        let reqId: number;
        do {
            reqId = this._getReqId();
        } while (reqId in this._calls);

        const messageOptions = this._getCallMessageOptionsFromAdvancedOptions(advancedOptions);

        const { err, payloadItems } = payload ? this._packPPTPayload(payload, messageOptions) : {} as Partial<PackPPTPayloadResult>;

        if (err) {
            throw this._cache.opStatus.error;
        }

        // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
        this._send([WAMP_MSG_SPEC.CALL, reqId, messageOptions, topic, ...(payloadItems || [])]);
        this._cache.opStatus = { ...SUCCESS, reqId };
        this._calls[reqId] = getNewPromise<CallResult>() as WampCall;

        if (progress_callback) {
            this._calls[reqId].onProgress = progress_callback;
        }

        return reqId;
    }

    /** Remote Procedure Call */
    async call (topic: string, payload?: Payload, advancedOptions?: CallAdvancedOptions): Promise<CallResult> {
        const reqId = this._callInternal(topic, payload, advancedOptions);
        return this._calls[reqId].promise;
    }

    /**
     * Remote Procedure Progressive Call
     *
     * You can send additional input data which won't be treated as a new independent but instead
     * will be transferred as another input data chunk to the same remote procedure call. Of course
     * Callee and Dealer should support the "progressive_call_invocations" feature as well.
     */
    progressiveCall (topic: string, payload?: Payload, advancedOptions?: CallAdvancedOptions): ProgressiveCallReturn {
        if (!this._checkRouterFeature('dealer', 'progressive_call_invocations')) {
            throw this._cache.opStatus.error;
        }

        advancedOptions = advancedOptions || {} as CallAdvancedOptions;
        (advancedOptions as Record<string, unknown>).progress = true;    // Implicitly set the progress flag before making the first call
        const reqId = this._callInternal(topic, payload, advancedOptions);

        const messageOptions = this._getCallMessageOptionsFromAdvancedOptions(advancedOptions);

        // Now we need to construct the function tha client may call to pass another input data chunk
        const cb = (payload?: Payload, advancedOptions?: ProgressiveCallSendDataOptions): void => {
            if (advancedOptions && !this._isPlainObject(advancedOptions)) {
                const invalidParamError = new Errors.InvalidParamError('advancedOptions');
                this._fillOpStatusByError(invalidParamError);
                throw invalidParamError;
            }

            const msgOpt = messageOptions;
            const { progress } = advancedOptions || {} as ProgressiveCallSendDataOptions;
            if (progress !== undefined) {
                if (typeof progress === 'boolean') {
                    msgOpt.progress = progress;
                } else {
                    const invalidParamError = new Errors.InvalidParamError('progress');
                    this._fillOpStatusByError(invalidParamError);
                    throw invalidParamError;
                }
            }

            const { err, payloadItems } = payload ? this._packPPTPayload(payload, messageOptions) : {} as Partial<PackPPTPayloadResult>;

            if (err) {
                throw this._cache.opStatus.error;
            }

            // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
            this._send([WAMP_MSG_SPEC.CALL, reqId, messageOptions, topic, ...(payloadItems || [])]);
            this._cache.opStatus = { ...SUCCESS, reqId };
        };

        return {
            result: this._calls[reqId].promise,
            sendData: cb
        };
    }

    /** RPC invocation cancelling */
    cancel (reqId: number, advancedOptions?: CancelAdvancedOptions): boolean {
        if (!this._preReqChecks(null, 'dealer') || !this._checkRouterFeature('dealer', 'call_canceling')) {
            throw this._cache.opStatus.error;
        }

        if (!reqId || !this._calls[reqId]) {
            const nonExistRPCReqIdError = new Errors.NonExistRPCReqIdError();
            this._fillOpStatusByError(nonExistRPCReqIdError);
            throw nonExistRPCReqIdError;
        }

        if (!this._isPlainObject(advancedOptions) && (advancedOptions) !== undefined) {
            const invalidParamError = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        let mode: string | undefined;
        if (this._isPlainObject(advancedOptions) && Object.hasOwnProperty.call(advancedOptions, 'mode')) {
            if (!['skip', 'kill', 'killnowait'].includes(advancedOptions.mode as string)) {
                const error = new Errors.InvalidParamError('mode');
                this._fillOpStatusByError(error);
                throw error;
            }
            mode = advancedOptions.mode;
        }

        // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]
        const options: Record<string, unknown> = {
            ...(mode ? { mode } : {}),
            ...this._extractCustomOptions(advancedOptions)
        };
        this._send([WAMP_MSG_SPEC.CANCEL, reqId, options]);
        this._cache.opStatus = { ...SUCCESS, reqId: reqId };

        return true;
    }

    /** RPC registration for invocation */
    async register (topic: string, rpc: RPCCallback, advancedOptions?: RegisterAdvancedOptions): Promise<RegisterSuccessResult> {
        if (this._rpcRegs[topic]?.callbacks?.length) {
            const rpcAlreadyRegisteredError = new Errors.RPCAlreadyRegisteredError();
            this._fillOpStatusByError(rpcAlreadyRegisteredError);
            throw rpcAlreadyRegisteredError;
        }

        if (typeof rpc !== 'function') {
            const noCallbackError = new Errors.NoCallbackError();
            this._fillOpStatusByError(noCallbackError);
            throw noCallbackError;
        }

        if (advancedOptions && !this._isPlainObject(advancedOptions)) {
            const invalidParamError = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        const { match, invoke } = advancedOptions || {} as RegisterAdvancedOptions;
        const isMatchInvalid = match && !['exact', 'prefix', 'wildcard'].includes(match);
        const isInvokeInvalid = invoke && !['single', 'roundrobin', 'random', 'first', 'last'].includes(invoke);

        if (isMatchInvalid || isInvokeInvalid) {
            const parameter = isMatchInvalid ? 'match' : 'invoke';
            const invalidParamError = new Errors.InvalidParamError(parameter);
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        if (!this._preReqChecks({ topic, patternBased: Boolean(match), allowWAMP: false }, 'dealer')) {
            throw this._cache.opStatus.error;
        }

        const reqId = this._getReqId();
        const callbacks = getNewPromise<RegisterSuccessResult>() as RegisterRequestCallbacks;
        const options: Record<string, unknown> = {
            ... (match ? { match } : {}),
            ... (invoke ? { invoke } : {}),
            ...this._extractCustomOptions(advancedOptions)
        };

        if (rpc) {
            callbacks.rpc = rpc;
        }

        this._requests[reqId] = { topic, callbacks, options: options as RegisterAdvancedOptions };

        // WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]
        this._send([WAMP_MSG_SPEC.REGISTER, reqId, options, topic]);
        this._cache.opStatus = { ...SUCCESS, reqId };

        return callbacks.promise;
    }

    /** RPC unregistration for invocation */
    async unregister (topic: string): Promise<UnregisterSuccessResult> {
        if (!this._preReqChecks({ topic, patternBased: false, allowWAMP: false }, 'dealer')) {
            throw this._cache.opStatus.error;
        }

        if (!this._rpcRegs[topic]) {
            const nonExistRpcUnregistrationError = new Errors.NonExistRPCUnregistrationError();
            this._fillOpStatusByError(nonExistRpcUnregistrationError);
            throw nonExistRpcUnregistrationError;
        }

        const reqId = this._getReqId();
        const callbacks = getNewPromise<UnregisterSuccessResult>();

        this._requests[reqId] = { topic, callbacks: callbacks as unknown as Deferred };

        // WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]
        this._send([WAMP_MSG_SPEC.UNREGISTER, reqId, this._rpcRegs[topic].id]);
        this._cache.opStatus = { ...SUCCESS, reqId };

        return callbacks.promise;
    }
}

export default Wampy;
export { Wampy };
export * as Errors from './errors.js';
