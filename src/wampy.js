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

import { WAMP_MSG_SPEC, WAMP_ERROR_MSG, E2EE_SERIALIZERS, SUCCESS } from './constants.js';
import * as Errors from './errors.js';
import { getWebSocket, getNewPromise } from './utils.js';
import { JsonSerializer } from './serializers/JsonSerializer.js';
import { WebsocketError } from './errors.js';
const jsonSerializer = new JsonSerializer();

/**
 * WAMP Client Class
 */
class Wampy {

    /**
     * Wampy constructor
     * @param {string} [url]
     * @param {Object} [options]
     */
    constructor (url, options) {

        /**
         * Wampy version
         * @type {string}
         * @private
         */
        this.version = 'v7.1.0';

        /**
         * WS Url
         * @type {string}
         * @private
         */
        this._url = (typeof url === 'string') ? url : null;

        /**
         * WS protocols
         * @type {Array}
         * @private
         */
        this._protocols = ['wamp.2.json'];

        /**
         * WAMP features, supported by Wampy
         * @type {object}
         * @private
         */
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

        /**
         * Internal cache for object lifetime
         * @type {Object}
         * @private
         */
        this._cache = {
            /**
             * WAMP Session ID
             * @type {string|null}
             */
            sessionId: null,

            /**
             * WAMP Session scope requests ID
             * @type {int}
             */
            reqId: 0,

            /**
             * Server WAMP roles and features
             */
            server_wamp_features: { roles: {} },

            /**
             * Are we in state of saying goodbye
             * @type {boolean}
             */
            isSayingGoodbye: false,

            /**
             * Status of last operation
             */
            opStatus: {

                /**
                 * Int code of last operation
                 * @type {int}
                 */
                code: 0,

                /**
                 * Error of last operation (if not was successful)
                 * @type {Error}
                 */
                error: null,

                /**
                 * Request ID of last successfully sent operation
                 * @type {int}
                 */
                reqId: 0
            },

            /**
             * Timer for reconnection
             * @type {int|null}
             */
            timer: null,

            /**
             * Reconnection attempts
             * @type {number}
             */
            reconnectingAttempts: 0,

            /**
             * Promise for onConnect
             */
            connectPromise: null,

            /**
             * Promise for onClose
             */
            closePromise: null
        };

        /**
         * WebSocket object
         * @type {WebSocket}
         * @private
         */
        this._ws = null;

        /**
         * Internal queue for websocket requests, for case of disconnect
         * @type {Array}
         * @private
         */
        this._wsQueue = [];

        /**
         * Internal queue for wamp requests
         * @type {object}
         * @private
         */
        this._requests = {};

        /**
         * Stored RPC
         * @type {object}
         * @private
         */
        this._calls = {};

        /**
         * Stored Pub/Subs to access by ID
         * @type {Map}
         * @private
         */
        this._subscriptionsById = new Map();

        /**
         * Stored Pub/Subs to access by Key
         * @type {Map}
         * @private
         */
        this._subscriptionsByKey = new Map();

        /**
         * Stored RPC Registrations
         * @type {object}
         * @private
         */
        this._rpcRegs = {};

        /**
         * Stored RPC names
         * @type {Set}
         * @private
         */
        this._rpcNames = new Set();

        /**
         * Options hash-table
         * @type {Object}
         * @private
         */
        this._options = {
            /**
             * Logging
             * @type {boolean}
             */
            debug: false,

            /**
             * Logger
             * @type {function}
             */
            logger: null,

            /**
             * Reconnecting flag
             * @type {boolean}
             */
            autoReconnect: true,

            /**
             * Reconnecting interval (in ms)
             * @type {number}
             */
            reconnectInterval: 2 * 1000,

            /**
             * Maximum reconnection retries
             * @type {number}
             */
            maxRetries: 25,

            /**
             * WAMP Realm to join
             * @type {string|null}
             */
            realm: null,

            /**
             * Custom attributes to send to router on hello
             * @type {object}
             */
            helloCustomDetails: null,

            /**
             * Validation of the topic URI structure
             * @type {string} - strict or loose
             */
            uriValidation: 'strict',

            /**
             * Authentication id to use in challenge
             * @type {string|null}
             */
            authid: null,

            /**
             * Supported authentication methods
             * @type {array}
             */
            authmethods: [],

            /**
             * Additional authentication options (used in WAMP CryptoSign for example)
             * @type {object}
             */
            authextra: {},

            /**
             * Authentication helpers for processing different authmethods challenge flows
             * @type {object}
             */
            authPlugins: {},

            /**
             * Mode of authorization flow
             * Possible values: manual | auto
             * @type {string}
             */
            authMode: 'manual',

            /**
             * onChallenge callback
             * @type {function}
             */
            onChallenge: null,

            /**
             * onClose callback
             * @type {function}
             */
            onClose: null,

            /**
             * onError callback
             * @type {function}
             */
            onError: null,

            /**
             * onReconnect callback
             * @type {function}
             */
            onReconnect: null,

            /**
             * onReconnectSuccess callback
             * @type {function}
             */
            onReconnectSuccess: null,

            /**
             * User provided WebSocket class
             * @type {function}
             */
            ws: null,

            /**
             * User provided additional HTTP headers (for use in Node.js environment)
             * @type {object}
             */
            additionalHeaders: null,

            /**
             * User provided WS Client Config Options (for use in Node.js environment)
             * @type {object}
             */
            wsRequestOptions: null,

            /**
             * User provided Serializer class
             * @type {object}
             */
            serializer: jsonSerializer,

            /**
             * User provided Serializers for Payload Passthru Mode
             * @type {object}
             */
            payloadSerializers: {
                json: jsonSerializer
            }
        };

        if (this._isPlainObject(options)) {
            this._options = { ...this._options, ...options };
        } else if (this._isPlainObject(url)) {
            this._options = { ...this._options, ...url };
        }
    }

    /* Internal utils methods */
    /**
     * Internal logger
     * @private
     */
    _log (...args) {
        if (!this._options.debug) { return; }

        if (this._options.logger) {
            return this._options.logger(args);
        }

        return console.log('[wampy]', args);
    }

    /**
     * Get the new unique request id
     * @returns {number}
     * @private
     */
    _getReqId () {
        return ++this._cache.reqId;
    }

    /**
     * Check if input is an object literal
     * @param input
     * @returns {boolean}
     * @private
     */
    _isPlainObject (input) {
        const constructor = input?.constructor;
        const prototype = constructor?.prototype;

        return Object.prototype.toString.call(input) === '[object Object]'     // checks for primitives, null, Arrays, DOM, etc.
            && typeof constructor === 'function'                               // checks for modified constructors
            && Object.prototype.toString.call(prototype) === '[object Object]' // checks for modified prototypes
            && Object.hasOwnProperty.call(prototype, 'isPrototypeOf');         // checks for missing object-specific property
    }

    /**
     * Set websocket protocol based on options
     * @private
     */
    _setWsProtocols () {
        this._protocols = ['wamp.2.' + this._options.serializer.protocol];
        // FIXME: Temporary commented out due to bug in Nexus
        // if (!(this._options.serializer instanceof JsonSerializer)) {
        //     this._protocols.unshift('wamp.2.' + this._options.serializer.protocol);
        // }
    }

    /**
     * Fill instance operation status
     * @param {Error} err
     * @private
     */
    _fillOpStatusByError (err) {
        this._cache.opStatus = {
            code: err.code,
            error: err,
            reqId: 0
        };
    }

    /**
     * Prerequisite checks for any wampy api call
     * @param {object} topicType { topic: URI, patternBased: true|false, allowWAMP: true|false }
     * @param {string} role
     * @returns {boolean}
     * @private
     */
    _preReqChecks (topicType, role) {
        if (this._cache.sessionId && !this._cache.server_wamp_features.roles[role]) {
            const errorsByRole = {
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

    /**
     * Check for specified feature in a role of connected WAMP Router
     * @param {string} role
     * @param {string} feature
     * @returns {boolean}
     * @private
     */
    _checkRouterFeature (role, feature) {
        if (this._cache.server_wamp_features.roles[role].features[feature] !== true) {
            this._fillOpStatusByError(new Errors.FeatureNotSupportedError(role, feature));
            return false;
        }

        return true;
    }

    /**
     * Check for PPT mode options correctness
     * @param {string} role WAMP Router Role to check support
     * @param {object} options
     * @returns {boolean}
     * @private
     */
    _checkPPTOptions (role, options) {
        if (!this._checkRouterFeature(role, 'payload_passthru_mode')) {
            this._fillOpStatusByError(new Errors.PPTNotSupportedError());
            return false;
        }

        if (options.ppt_scheme.search(/^(wamp$|mqtt$|x_)/) < 0) {
            this._fillOpStatusByError(new Errors.PPTInvalidSchemeError());
            return false;
        }

        if (options.ppt_scheme === 'wamp' && !E2EE_SERIALIZERS.includes(options.ppt_serializer)) {
            this._fillOpStatusByError(new Errors.PPTSerializerInvalidError());
            return false;
        }

        return true;
    }

    /**
     * Validate uri
     * @param {string} uri
     * @param {boolean} isPatternBased
     * @param {boolean} isWampAllowed
     * @returns {boolean}
     * @private
     */
    _validateURI (uri, isPatternBased, isWampAllowed) {
        const isStrictValidation = this._options.uriValidation === 'strict';
        const isLooseValidation = this._options.uriValidation === 'loose';
        const isValidationTypeUnknown = !isStrictValidation && !isLooseValidation;

        if (isValidationTypeUnknown || (uri.startsWith('wamp.') && !isWampAllowed)) {
            return false;
        }

        let reBase, rePattern;
        if (isStrictValidation) {
            reBase = /^(\w+\.)*(\w+)$/;
            rePattern = /^(\w+\.{1,2})*(\w+)$/;
        } else if (isLooseValidation) {
            reBase = /^([^\s.#]+\.)*([^\s.#]+)$/;
            rePattern = /^([^\s.#]+\.{1,2})*([^\s.#]+)$/;
        }

        return (isPatternBased ? rePattern : reBase).test(uri);
    }

    /**
     * Prepares PPT/E2EE payload for adding to WAMP message
     * @param {string|number|Array|object} payload
     * @param {Object} options
     * @returns {Object}
     * @private
     */
    _packPPTPayload (payload, options) {
        const isArgsListInvalid = payload?.argsList && !Array.isArray(payload.argsList);
        const isArgsDictInvalid = payload?.argsDict && !this._isPlainObject(payload.argsDict);

        if (isArgsListInvalid || isArgsDictInvalid) {
            const invalidParameter = isArgsListInvalid ? payload.argsList : payload.argsDict;
            this._fillOpStatusByError(new Errors.InvalidParamError(invalidParameter));
            return { err: true, payloadItems: [] };
        }

        const isPayloadAnObject = this._isPlainObject(payload);
        const { argsList, argsDict } = payload;
        let args, kwargs;

        if (isPayloadAnObject && !argsList && !argsDict) {
            kwargs = payload;
        } else if (isPayloadAnObject) {
            args = argsList;
            kwargs = argsDict;
        } else if (Array.isArray(payload)) {
            args = payload;
        } else {  // assume it's a single value
            args = [payload];
        }

        const payloadItems = [];

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
        let binPayload = pptPayload;

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (options.ppt_serializer && options.ppt_serializer !== 'native') {
            const pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

            if (!pptSerializer) {
                this._fillOpStatusByError(new Errors.PPTSerializerInvalidError());
                return { err: true, payloadItems };
            }

            try {
                binPayload = pptSerializer.encode(pptPayload);
            } catch (e) {
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

    /**
     * Unpack PPT/E2EE payload to common
     * @param {string} role
     * @param {Array} pptPayload
     * @param {Object} options
     * @returns {Object}
     * @private
     */
    _unpackPPTPayload (role, pptPayload, options) {
        let decodedPayload;

        if (!this._checkPPTOptions(role, options)) {
            return { err: this._cache.opStatus.error };
        }

        // TODO: implement End-to-End Encryption
        // wamp scheme means Payload End-to-End Encryption
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
        // if (options.ppt_scheme === 'wamp') {
        //
        // }

        if (options.ppt_serializer && options.ppt_serializer !== 'native') {
            const pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

            if (!pptSerializer) {
                return { err: new Errors.PPTSerializerInvalidError() };
            }

            try {
                decodedPayload = pptSerializer.decode(pptPayload);
            } catch (e) {
                return { err: new Errors.PPTSerializationError() };
            }
        } else {
            decodedPayload = pptPayload;
        }
        return { err:false, args: decodedPayload.args, kwargs: decodedPayload.kwargs };
    }

    /**
     * Encode WAMP message
     * @param {Array} msg
     * @returns {*}
     * @private
     */
    _encode (msg) {
        try {
            return this._options.serializer.encode(msg);
        } catch (e) {
            this._hardClose('wamp.error.protocol_violation', 'Can not encode message', true);
        }
    }

    /**
     * Decode WAMP message
     * @param  msg
     * @returns {Promise}
     * @private
     */
    _decode (msg) {
        try {
            return this._options.serializer.decode(msg);
        } catch (e) {
            this._hardClose('wamp.error.protocol_violation', 'Can not decode received message');
        }
    }

    /**
     * Hard close of connection due to protocol violations
     * @param {string} errorUri
     * @param {string} details
     * @param {boolean} [noSend]
     * @private
     */
    _hardClose (errorUri, details, noSend = false) {
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

        this._ws.close();
    }

    /**
     * Send encoded message to server
     * @param {Array} [msg]
     * @private
     */
    _send (msg) {
        if (msg) {
            this._wsQueue.push(this._encode(msg));
        }

        if (this._ws && this._ws.readyState === 1 && this._cache.sessionId) {
            while (this._wsQueue.length) {
                this._ws.send(this._wsQueue.shift());
            }
        }
    }

    /**
     * Reject (fail) all ongoing promises on connection closing
     * @private
     * @param {Error} error
     */
    async _reject_ongoing_promises (error) {
        for (const [requestId, call] of Object.entries(this._calls)) {
            if (call.onError) {
                await call.onError(error);
            }
            delete this._calls[requestId];
        }
        for (const [requestId, req] of Object.entries(this._requests)) {
            if (req.callbacks?.onError) {
                await req.callbacks.onError(error);
            }
            delete this._requests[requestId];
        }
    }

    /**
     * Reset internal state and cache
     * @private
     */
    _resetState () {
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
        };
    }

    /**
     * Initialize internal websocket callbacks
     * @private
     */
    _initWsCallbacks () {
        this._ws.onopen = () => this._wsOnOpen();
        this._ws.onclose = async (event) => this._wsOnClose(event);
        this._ws.onmessage = (event) => this._wsOnMessage(event);
        this._ws.onerror = async (error) => this._wsOnError(error);
    }

    /**
     * Internal websocket on open callback
     * @private
     */
    _wsOnOpen () {
        const { helloCustomDetails, authmethods, authid, authextra, serializer, onError, realm } = this._options;
        const serverProtocol = this._ws.protocol?.split('.')?.[2];
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
            this._ws.binaryType = 'arraybuffer';
        }

        const messageOptions = {
            ...helloCustomDetails,
            ...this._wamp_features,
            ...(authid ? { authid, authmethods, authextra } : {}),
        };
        const encodedMessage = this._encode([WAMP_MSG_SPEC.HELLO, realm, messageOptions]);

        if (encodedMessage) {
            // Sending directly 'cause it's a hello message and no sessionId check is needed
            this._ws.send(encodedMessage);
        }
    }

    /**
     * Internal websocket on close callback
     * @param {object} event
     * @private
     */
    async _wsOnClose (event) {
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
                this._cache.closePromise.onSuccess();
                this._cache.closePromise = null;
            }
            this._resetState();
            this._ws = null;
        }
    }

    /**
     * Internal websocket on event callback
     * @param {object} event
     * @private
     */
    async _wsOnMessage (event) {
        const data = this._decode(event.data);

        this._log('websocket message received: ', data);

        const messageType = data[0];
        const messageHandlers = {
            [WAMP_MSG_SPEC.WELCOME]:      () => this._onWelcomeMessage(data),
            [WAMP_MSG_SPEC.ABORT]:        () => this._onAbortMessage(data),
            [WAMP_MSG_SPEC.CHALLENGE]:    () => this._onChallengeMessage(data),
            [WAMP_MSG_SPEC.GOODBYE]:      () => this._onGoodbyeMessage(data),
            [WAMP_MSG_SPEC.ERROR]:        () => this._onErrorMessage(data),
            [WAMP_MSG_SPEC.SUBSCRIBED]:   () => this._onSubscribedMessage(data),
            [WAMP_MSG_SPEC.UNSUBSCRIBED]: () => this._onUnsubscribedMessage(data),
            [WAMP_MSG_SPEC.PUBLISHED]:    () => this._onPublishedMessage(data),
            [WAMP_MSG_SPEC.EVENT]:        () => this._onEventMessage(data),
            [WAMP_MSG_SPEC.RESULT]:       () => this._onResultMessage(data),
            // [WAMP_MSG_SPEC.REGISTER]:     () => {},
            [WAMP_MSG_SPEC.REGISTERED]:   () => this._onRegisteredMessage(data),
            // [WAMP_MSG_SPEC.UNREGISTER]:  () => {},
            [WAMP_MSG_SPEC.UNREGISTERED]: () => this._onUnregisteredMessage(data),
            [WAMP_MSG_SPEC.INVOCATION]:   () => this._onInvocationMessage(data),
            // [WAMP_MSG_SPEC.INTERRUPT]:    () => {},
            // [WAMP_MSG_SPEC.YIELD]:        () => {},
        };
        const handler = messageHandlers[messageType];
        const errorURI = 'wamp.error.protocol_violation';

        if (!handler) {
            return this._hardClose(errorURI, `Received non-compliant WAMP message: "${messageType}"`);
        }

        const needNoSession = [WAMP_MSG_SPEC.WELCOME, WAMP_MSG_SPEC.CHALLENGE].includes(messageType);
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

    /**
     * Validates the requestId for message types that need this kind of validation
     * @param {Array} data - [messageType, requestId]
     * @return {boolean} true if it's a valid request and false if it isn't
     * @private
     */
    _isRequestIdValid ([messageType, requestId]) {
        const isRequestIdValidationNeeded = [
            WAMP_MSG_SPEC.SUBSCRIBED,
            WAMP_MSG_SPEC.UNSUBSCRIBED,
            WAMP_MSG_SPEC.PUBLISHED,
            WAMP_MSG_SPEC.RESULT,
            WAMP_MSG_SPEC.REGISTERED,
            WAMP_MSG_SPEC.UNREGISTERED
        ].includes(messageType);

        if (!isRequestIdValidationNeeded) {
            return true;
        }

        if (messageType === WAMP_MSG_SPEC.RESULT && this._calls[requestId]) {
            return true;
        }

        if (this._requests[requestId]) {
            return true;
        }

        return false;
    }

    /**
     * Handles websocket welcome message event
     * WAMP SPEC: [WELCOME, Session|id, Details|dict]
     * @param {Array} [, sessionId, details] - decoded event data
     * @private
     */
    async _onWelcomeMessage ([, sessionId, details]) {
        this._cache.sessionId = sessionId;
        this._cache.server_wamp_features = details;

        if (this._cache.reconnectingAttempts) {
            this._cache.reconnectingAttempts = 0;

            if (this._options.onReconnectSuccess) {
                await this._options.onReconnectSuccess(details);
            }

            // Renew all previous state
            this._renewSubscriptions();
            this._renewRegistrations();

        } else {
            // Fire onConnect event on real connection to WAMP server
            this._cache.connectPromise.onSuccess(details);
            this._cache.connectPromise = null;
        }

        // Send local queue if there is something out there
        this._send();
    }

    /**
     * Handles websocket abort message event
     * WAMP SPEC: [ABORT, Details|dict, Error|uri]
     * @param {Array} [, details, error] - decoded event data array
     * @private
     */
    async _onAbortMessage ([, details, error]) {
        const err = new Errors.AbortError({ error, details });
        if (this._cache.connectPromise) {
            this._cache.connectPromise.onError(err);
            this._cache.connectPromise = null;
        }
        if (this._options.onError) {
            await this._options.onError(err);
        }
        this._ws.close();
    }

    /**
     * Handles websocket challenge message event
     * WAMP SPEC: [CHALLENGE, AuthMethod|string, Extra|dict]
     * @param {Array} [, authMethod, extra] - decoded event data array
     * @private
     */
    async _onChallengeMessage ([, authMethod, extra]) {
        let promise;

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
            this._ws.send(this._encode([
                WAMP_MSG_SPEC.ABORT,
                { message: noCRACallbackOrIdError.message },
                'wamp.error.cannot_authenticate'
            ]));

            if (onError) {
                await onError(noCRACallbackOrIdError);
            }

            return this._ws.close();
        }

        try {
            const key = await promise;

            // Sending directly 'cause it's a challenge msg and no sessionId check is needed
            this._ws.send(this._encode([WAMP_MSG_SPEC.AUTHENTICATE, key, {}]));
        } catch (e) {
            const challengeExceptionError = new Errors.ChallengeExceptionError();

            this._fillOpStatusByError(challengeExceptionError);
            this._ws.send(this._encode([
                WAMP_MSG_SPEC.ABORT,
                { message: challengeExceptionError.message },
                'wamp.error.cannot_authenticate'
            ]));

            if (onError) {
                await onError(challengeExceptionError);
            }

            this._ws.close();
        }
    }

    /**
     * Handles websocket goodbye message event
     * WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
     * @private
     */
    async _onGoodbyeMessage () {
        if (!this._cache.isSayingGoodbye) {    // get goodbye, initiated by server
            this._cache.isSayingGoodbye = true;
            this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.goodbye_and_out']);
        }
        this._cache.sessionId = null;
        this._ws.close();
    }

    /**
     * Handles websocket error message event
     * WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict,
     *             Error|uri, (Arguments|list, ArgumentsKw|dict)]
     * @param {Array} [, requestType, requestId, details, error, argsList, argsDict] - decoded event data array
     * @private
     */
    async _onErrorMessage ([, requestType, requestId, details, error, argsList, argsDict]) {
        const errorOptions = { error, details, argsList, argsDict };
        const errorsByRequestType = {
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
            if (this._calls[requestId]?.onError) {
                await this._calls[requestId].onError(currentError);
            }
            delete this._calls[requestId];
        } else {
            if (this._requests[requestId]?.callbacks?.onError) {
                await this._requests[requestId].callbacks.onError(currentError);
            }
            delete this._requests[requestId];
        }
    }

    /**
     * Handles websocket subscribed message event
     * WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
     * @param {Array} [, requestId, subscriptionId] - decoded event data Array, with the
     * second and third elements of the Array being the requestId and subscriptionId respectively
     * @private
     */
    async _onSubscribedMessage ([, requestId, subscriptionId]) {
        const { topic, advancedOptions, callbacks } = this._requests[requestId];
        const subscription = {
            id: subscriptionId,
            topic,
            advancedOptions,
            callbacks: [callbacks.onEvent]
        };
        const subscriptionKey = this._getSubscriptionKey(topic, advancedOptions);

        this._subscriptionsById.set(subscriptionId, subscription);
        this._subscriptionsByKey.set(subscriptionKey, subscription);

        if (callbacks.onSuccess) {
            await callbacks.onSuccess({ topic, requestId, subscriptionId, subscriptionKey });
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket unsubscribed message event
     * WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
     * @param {Array} [, requestId] - decoded event data Array, with the
     * second element of the Array being the requestId
     * @private
     */
    async _onUnsubscribedMessage ([, requestId]) {
        const { topic, advancedOptions, callbacks } = this._requests[requestId];
        const subscriptionKey = this._getSubscriptionKey(topic, advancedOptions);
        const subscriptionId = this._subscriptionsByKey.get(subscriptionKey).id;
        this._subscriptionsByKey.delete(subscriptionKey);
        this._subscriptionsById.delete(subscriptionId);

        if (callbacks.onSuccess) {
            await callbacks.onSuccess({ topic, requestId });
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket published message event
     * WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
     * @param {Array} [, requestId, publicationId] - decoded event data
     * @private
     */
    async _onPublishedMessage ([, requestId, publicationId]) {
        const { topic, callbacks } = this._requests[requestId];

        if (callbacks?.onSuccess) {
            await callbacks.onSuccess({ topic, requestId, publicationId });
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket event message event
     * WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id,
     *            Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]
     * @param {Array} [, subscriptionId, publicationId, details, argsList, argsDict] - decoded event data
     * @private
     */
    async _onEventMessage ([, subscriptionId, publicationId, details, argsList, argsDict]) {
        const subscription = this._subscriptionsById.get(subscriptionId);

        if (!subscription) {
            return;
        }

        let args = argsList;
        let kwargs = argsDict;

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (details.ppt_scheme) {
            const pptPayload = argsList[0];
            const decodedPayload = this._unpackPPTPayload('broker', pptPayload, details);

            if (decodedPayload.err) {
                // Since it is async publication, and no link to
                // original publication - as it was already published
                // we can not reply with error, only log it.
                // Although the router should handle it
                return this._log(decodedPayload.err.message);
            }

            args = decodedPayload.args;
            kwargs = decodedPayload.kwargs;
        }

        const callbackOptions = { details, argsList: args, argsDict: kwargs };
        const callbackPromises = subscription.callbacks.map((c) => c(callbackOptions));

        await Promise.all(callbackPromises);
    }

    /**
     * Handles websocket result message event
     * WAMP SPEC: [RESULT, CALL.Request|id, Details|dict,
     *             YIELD.Arguments|list, YIELD.ArgumentsKw|dict]
     * @param {object} data - decoded event data
     * @private
     */
    async _onResultMessage ([, requestId, details, argsList, argsDict]) {
        let args = argsList;
        let kwargs = argsDict;

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (details.ppt_scheme) {
            const pptPayload = argsList[0];
            const decodedPayload = this._unpackPPTPayload('dealer', pptPayload, details);

            if (decodedPayload.err) {
                this._log(decodedPayload.err.message);
                this._cache.opStatus = decodedPayload.err;
                await this._calls[requestId].onError(new Errors.CallError({
                    details,
                    error     : 'wamp.error.invocation_exception',
                    argsList  : [decodedPayload.err.message],
                    argsDict  : null
                }));
                delete this._calls[requestId];

                return;
            }

            args = decodedPayload.args;
            kwargs = decodedPayload.kwargs;
        }

        const callbackOptions = { details, argsList: args, argsDict: kwargs };

        if (details.progress) {
            await this._calls[requestId].onProgress(callbackOptions);
        } else {
            // We received final result (progressive or not)
            await this._calls[requestId].onSuccess(callbackOptions);
            delete this._calls[requestId];
        }
    }

    /**
     * Handles websocket registered message event
     * WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
     * @param {Array} [, requestId, registrationId] - decoded event data array
     * @private
     */
    async _onRegisteredMessage ([, requestId, registrationId]) {
        const { topic, callbacks } = this._requests[requestId];

        this._rpcRegs[registrationId] = { id: registrationId, callbacks: [callbacks.rpc] };
        this._rpcRegs[topic] = this._rpcRegs[registrationId];
        this._rpcNames.add(topic);

        if (callbacks?.onSuccess) {
            await callbacks.onSuccess({ topic, requestId, registrationId });
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket unregistered message event
     * WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
     * @param {Array} [, requestId] - decoded event data array
     * @private
     */
    async _onUnregisteredMessage ([, requestId]) {
        const { topic, callbacks } = this._requests[requestId];

        delete this._rpcRegs[this._rpcRegs[topic].id];
        delete this._rpcRegs[topic];

        if (this._rpcNames.has(topic)) {
            this._rpcNames.delete(topic);
        }

        if (callbacks?.onSuccess) {
            await callbacks.onSuccess({ topic, requestId });
        }

        delete this._requests[requestId];
    }

    /**
     * Handles websocket invocation message event
     * WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id, Details|dict,
     *             CALL.Arguments|list, CALL.ArgumentsKw|dict]
     * @param {Array} data - decoded event data array
     * @private
     */
    async _onInvocationMessage ([, requestId, registrationId, details, argsList, argsDict]) {
        const self = this;
        const handleInvocationError = ({ error, details, argsList, argsDict }) => {
            const message = [
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
            const pptPayload = argsList[0];
            const decodedPayload = this._unpackPPTPayload('dealer', pptPayload, details);

            // This case should not happen at all, but for safety
            if (decodedPayload.err) {
                this._log(decodedPayload.err.message);

                if (decodedPayload.err instanceof Errors.PPTNotSupportedError) {
                    // This case should not happen at all, but for safety
                    return this._hardClose('wamp.error.protocol_violation',
                        'Received INVOCATION in PPT Mode, while Dealer didn\'t announce it');
                }

                return handleInvocationError({
                    details,
                    error: 'wamp.error.invocation_exception',
                    argsList: [decodedPayload.err.message],
                });
            }

            args = decodedPayload.args;
            kwargs = decodedPayload.kwargs;
        }

        const handleInvocationResult = (result) => {
            const options = result?.options || {};
            const { ppt_scheme, ppt_serializer, ppt_cipher, ppt_keyid } = options;

            // Check and handle Payload PassThru Mode
            // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
            if (ppt_scheme && !this._checkPPTOptions('dealer', options)) {
                if (this._cache.opStatus.error instanceof Errors.PPTNotSupportedError) {
                    // This case should not happen at all, but for safety
                    return this._hardClose('wamp.error.protocol_violation',
                        'Trying to send YIELD in PPT Mode, while Dealer didn\'t announce it');
                }

                return handleInvocationError({
                    details : options,
                    error   : 'wamp.error.invalid_option',
                    argsList: [this._cache.opStatus.error.message],
                });
            }

            const { err, payloadItems } = result ? this._packPPTPayload(result, options) : {};

            if (err) {
                return handleInvocationError({
                    details : options,
                    error   : 'wamp.error.invocation_exception',
                    argsList: [this._cache.opStatus.error.message],
                });
            }

            const messageOptions = {
                ...options,
                ...(ppt_scheme ? { ppt_scheme } : {}),
                ...(ppt_serializer ? { ppt_serializer } : {}),
                ...(ppt_cipher ? { ppt_cipher } : {}),
                ...(ppt_keyid ? { ppt_keyid } : {}),
            };

            // WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, Arguments|list, ArgumentsKw|dict]
            self._send([WAMP_MSG_SPEC.YIELD, requestId, messageOptions, ...(payloadItems || [])]);
        };

        try {
            const result = await this._rpcRegs[registrationId].callbacks[0]({
                details,
                argsList      : args,
                argsDict      : kwargs,
                result_handler: handleInvocationResult,
                error_handler : handleInvocationError
            });
            handleInvocationResult(result);
        } catch (e) {
            handleInvocationError(e);
        }
    }

    /**
     * Internal websocket on error callback
     * @param {object} error
     * @private
     */
    async _wsOnError (error) {
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

    /**
     * Reconnect to server in case of websocket error
     * @private
     */
    _wsReconnect () {
        this._log('websocket reconnecting...');

        if (this._options.onReconnect) {
            this._options.onReconnect();
        }

        this._cache.reconnectingAttempts++;
        this._ws = getWebSocket({
            url: this._url,
            protocols: this._protocols,
            options: this._options
        });
        this._initWsCallbacks();
    }

    /**
     * Resubscribe to topics in case of communication error
     * @private
     */
    _renewSubscriptions () {
        let i;
        const subs = new Map(this._subscriptionsById);

        this._subscriptionsById.clear();
        this._subscriptionsByKey.clear();

        subs.forEach((sub) => {
            i = sub.callbacks.length;
            while (i--) {
                this.subscribe(sub.topic, sub.callbacks[i], sub.advancedOptions);
            }
        });
    }

    /**
     * Reregister RPCs in case of communication error
     * @private
     */
    _renewRegistrations () {
        const rpcs = this._rpcRegs,
            rn = this._rpcNames;

        this._rpcRegs = {};
        this._rpcNames = new Set();

        for (const rpcName of rn) {
            this.register(rpcName, rpcs[rpcName].callbacks[0]);
        }
    }

    /**
     * Generate a unique key for combination of topic and options
     *
     * This is needed to allow subscriptions to the same topic URI but with different options
     *
     * @param {string} topic
     * @param {object} options
     * @private
     */
    _getSubscriptionKey (topic, options) {
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
     *
     * @param {object} [newOptions]
     * @returns {*}
     */
    options (newOptions) {
        console.warn('Wampy.options() is deprecated, please use Wampy.getOptions() or Wampy.setOptions() instead');

        if (typeof (newOptions) === 'undefined') {
            return this._options;
        } else if (this._isPlainObject(newOptions)) {
            this._options = { ...this._options, ...newOptions };
            return this;
        }
    }

    /**
     * Wampy options getter
     *
     * @returns {object}
     */
    getOptions () {
        return this._options;
    }

    /**
     * Wampy options setter
     *
     * @param {object} newOptions
     * @returns {*}
     */
    setOptions (newOptions) {
        if (this._isPlainObject(newOptions)) {
            this._options = { ...this._options, ...newOptions };
            return this;
        }
    }

    /**
     * Get the status of last operation
     *
     * @returns {object} with 3 fields: code, error, reqId
     *      code: 0 - if operation was successful
     *      code > 0 - if error occurred
     *      error: error instance containing details
     *      reqId: last successfully sent request ID
     */
    getOpStatus () {
        return this._cache.opStatus;
    }

    /**
     * Get the WAMP Session ID
     *
     * @returns {string} Session ID
     */
    getSessionId () {
        return this._cache.sessionId;
    }

    /**
     * Connect to server
     * @param {string} [url] New url (optional)
     * @returns {Promise}
     */
    async connect (url) {
        if (url) {
            this._url = url;
        }

        if (!this._options.realm) {
            const noRealmError = new Errors.NoRealmError();
            this._fillOpStatusByError(noRealmError);
            throw noRealmError;
        }

        const numberOfAuthOptions = (this._options.authid ? 1 : 0) +
                ((Array.isArray(this._options.authmethods) && this._options.authmethods.length) ? 1 : 0) +
                (typeof this._options.onChallenge === 'function' ||
                 Object.keys(this._options.authPlugins).length ? 1 : 0);

        if (numberOfAuthOptions > 0 && numberOfAuthOptions < 3) {
            const noCRACallbackOrIdError = new Errors.NoCRACallbackOrIdError();
            this._fillOpStatusByError(noCRACallbackOrIdError);
            throw noCRACallbackOrIdError;
        }

        this._setWsProtocols();
        this._ws = getWebSocket({
            url: this._url,
            protocols: this._protocols,
            options: this._options
        });

        if (!this._ws) {
            const noWsOrUrlError = new Errors.NoWsOrUrlError();
            this._fillOpStatusByError(noWsOrUrlError);
            throw noWsOrUrlError;
        }

        this._initWsCallbacks();

        const defer = getNewPromise();
        this._cache.connectPromise = defer;
        return defer.promise;
    }

    /**
     * Disconnect from server
     * @returns {Promise}
     */
    async disconnect () {
        if (this._cache.sessionId) {
            const defer = getNewPromise();
            this._cache.opStatus = SUCCESS;
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

    /**
     * Abort WAMP session establishment
     *
     * @returns {Wampy}
     */
    abort () {

        if (!this._cache.sessionId && this._ws.readyState === 1) {
            this._send([WAMP_MSG_SPEC.ABORT, {}, 'wamp.error.abort']);
            this._cache.sessionId = null;
        }

        this._ws.close();
        this._cache.opStatus = SUCCESS;

        return this;
    }

    /**
     * Subscribe to a topic on a broker
     *
     * @param {string} topic - a URI to subscribe to
     * @param {function} onEvent - received event callback
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { match: string matching policy ("exact"|"prefix"|"wildcard") }
     *
     * @returns {Promise}
     */
    async subscribe (topic, onEvent, advancedOptions) {
        const isAdvancedOptionsAnObject = this._isPlainObject(advancedOptions);

        if (!isAdvancedOptionsAnObject && (typeof (advancedOptions) !== 'undefined')) {
            const invalidParamError = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        let match, patternBased = false;
        if (isAdvancedOptionsAnObject && Object.prototype.hasOwnProperty.call(advancedOptions, 'match')) {
            if (!['exact', 'prefix', 'wildcard'].includes(advancedOptions.match)) {
                const invalidParamError = new Errors.InvalidParamError('match');
                this._fillOpStatusByError(invalidParamError);
                throw invalidParamError;
            }

            match = advancedOptions.match;
            patternBased = true;
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
        const callbacks = getNewPromise();

        callbacks.onEvent = onEvent;
        this._requests[reqId] = { topic, callbacks, advancedOptions };

        // WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
        this._send([WAMP_MSG_SPEC.SUBSCRIBE, reqId, { match }, topic]);
        this._cache.opStatus = { ...SUCCESS, reqId: reqId || 0 };

        return callbacks.promise;
    }

    /**
     * Unsubscribe from topic
     * @param {string|number} subscriptionIdOrKey Subscription ID or Key, received during .subscribe()
     * @param {function} [onEvent] - received event callback to remove (optional). If not provided -
     *                               all callbacks will be removed and unsubscribed on the server
     * @returns {Promise}
     */
    async unsubscribe (subscriptionIdOrKey, onEvent) {
        if (!this._preReqChecks(null, 'broker')) {
            throw this._cache.opStatus.error;
        }

        const subscription = this._subscriptionsById.get(subscriptionIdOrKey) ||
            this._subscriptionsByKey.get(subscriptionIdOrKey);

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
            this._cache.opStatus = SUCCESS;
            return true;
        }

        const reqId = this._getReqId();

        this._requests[reqId] = { topic: subscription.topic, callbacks: getNewPromise() };

        // WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]
        this._send([WAMP_MSG_SPEC.UNSUBSCRIBE, reqId, subscription.id]);
        this._cache.opStatus = { ...SUCCESS, reqId: reqId };

        return this._requests[reqId].callbacks.promise;
    }

    /**
     * Publish an event to the topic
     * @param {string} topic
     * @param {string|number|Array|object} [payload] - can be either a value of any type or null or even omitted.
     *                          Also, it is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { exclude: integer|array WAMP session id(s) that won't receive a published event,
     *                                      even though they may be subscribed
     *                            exclude_authid: string|array Authentication id(s) that won't receive
     *                                      a published event, even though they may be subscribed
     *                            exclude_authrole: string|array Authentication role(s) that won't receive
     *                                      a published event, even though they may be subscribed
     *                            eligible: integer|array WAMP session id(s) that are allowed
     *                                      to receive a published event
     *                            eligible_authid: string|array Authentication id(s) that are allowed
     *                                      to receive a published event
     *                            eligible_authrole: string|array Authentication role(s) that are allowed
     *                                      to receive a published event
     *                            exclude_me: bool flag of receiving publishing event by initiator
     *                            disclose_me: bool flag of disclosure of publisher identity (its WAMP session ID)
     *                                      to receivers of a published event
     *                            ppt_scheme: string Identifies the Payload Schema
     *                            ppt_serializer: string Specifies what serializer was used to encode the payload
     *                            ppt_cipher: string Specifies the cryptographic algorithm that was used to encrypt
     *                                      the payload
     *                            ppt_keyid: string Contains the encryption key id that was used to encrypt the payload
     *                          }
     * @returns {Promise}
     */
    async publish (topic, payload, advancedOptions) {
        if (!this._preReqChecks({ topic, patternBased: false, allowWAMP: false }, 'broker')) {
            throw this._cache.opStatus.error;
        }

        const isAdvancedOptionsAnObject = this._isPlainObject(advancedOptions);

        if (advancedOptions && !isAdvancedOptionsAnObject) {
            const error = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(error);
            throw error;
        }

        let messageOptions = {};
        const _optionsConvertHelper = (option, sourceType) => {
            if (advancedOptions[option]) {
                if (Array.isArray(advancedOptions[option]) && advancedOptions[option].length) {
                    messageOptions[option] = advancedOptions[option];
                } else if (typeof advancedOptions[option] === sourceType) {
                    messageOptions[option] = [advancedOptions[option]];
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

        const { ppt_scheme, ppt_serializer, ppt_cipher, ppt_keyid, exclude_me, disclose_me } = advancedOptions || {};

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (ppt_scheme && !this._checkPPTOptions('broker', advancedOptions)) {
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
        };

        const { err, payloadItems } = payload ? this._packPPTPayload(payload, messageOptions) : {};
        const reqId = this._getReqId();

        if (err) {
            throw this._cache.opStatus.error;
        }

        this._requests[reqId] = { topic, callbacks: getNewPromise() };
        this._cache.opStatus = { ...SUCCESS, reqId };
        this._send([WAMP_MSG_SPEC.PUBLISH, reqId, messageOptions, topic, ...(payloadItems || [])]);

        return this._requests[reqId].callbacks.promise;
    }

    /**
     * Remote Procedure Call
     * @param {string} topic - a topic URI to be called
     * @param {string|number|Array|object} [payload] - can be either a value of any type or null. Also, it
     *                          is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { disclose_me:      bool flag of disclosure of Caller identity (WAMP session ID)
     *                                              to endpoints of a routed call
     *                            progress_callback: function for handling progressive call results
     *                            timeout:          integer timeout (in ms) for the call to finish
     *                            ppt_scheme: string Identifies the Payload Schema
     *                            ppt_serializer: string Specifies what serializer was used to encode the payload
     *                            ppt_cipher: string Specifies the cryptographic algorithm that was used to encrypt
     *                                the payload
     *                            ppt_keyid: string Contains the encryption key id that was used to encrypt the payload
     *                          }
     * @returns {Promise}
     */
    async call (topic, payload, advancedOptions) {
        if (!this._preReqChecks({ topic, patternBased: false, allowWAMP: true }, 'dealer')) {
            throw this._cache.opStatus.error;
        }

        if (advancedOptions && !this._isPlainObject(advancedOptions)) {
            const invalidParamError = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        const { timeout, progress_callback, disclose_me } = advancedOptions || {};
        const isTimeoutInvalid = (timeout && typeof timeout !== 'number');
        const isProgressCallbackInvalid = (progress_callback && typeof progress_callback !== 'function');

        if (isTimeoutInvalid || isProgressCallbackInvalid) {
            const paramName = isTimeoutInvalid ? 'timeout' : 'progress_callback';
            const invalidParamError = new Errors.InvalidParamError(paramName);
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        const { ppt_scheme, ppt_serializer, ppt_cipher, ppt_keyid } = advancedOptions || {};

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (ppt_scheme && !this._checkPPTOptions('dealer', advancedOptions)) {
            throw this._cache.opStatus.error;
        }

        let reqId;
        do {
            reqId = this._getReqId();
        } while (reqId in this._calls);

        const messageOptions = {
            ...(progress_callback ? { receive_progress: true } : {}),
            ...(disclose_me ? { disclose_me: true } : {}),
            ...(timeout ? { timeout } : {}),
            ...(ppt_scheme ? { ppt_scheme } : {}),
            ...(ppt_serializer ? { ppt_serializer } : {}),
            ...(ppt_cipher ? { ppt_cipher } : {}),
            ...(ppt_keyid ? { ppt_keyid } : {}),
        };

        const { err, payloadItems } = payload ? this._packPPTPayload(payload, messageOptions) : {};

        if (err) {
            throw this._cache.opStatus.error;
        }

        // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
        this._send([WAMP_MSG_SPEC.CALL, reqId, messageOptions, topic, ...(payloadItems || [])]);
        this._cache.opStatus = { ...SUCCESS, reqId };
        this._calls[reqId] = getNewPromise();

        if (progress_callback) {
            this._calls[reqId].onProgress = progress_callback;
        }

        return this._calls[reqId].promise;
    }

    /**
     * RPC invocation cancelling
     *
     * @param {int} reqId RPC call request ID
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { mode: string|one of the possible modes:
     *                                  "skip" | "kill" | "killnowait". Skip is default.
     *                          }
     *
     * @returns {Boolean}
     */
    cancel (reqId, advancedOptions) {
        if (!this._preReqChecks(null, 'dealer') || !this._checkRouterFeature('dealer', 'call_canceling')) {
            throw this._cache.opStatus.error;
        }

        if (!reqId || !this._calls[reqId]) {
            const nonExistRPCReqIdError = new Errors.NonExistRPCReqIdError();
            this._fillOpStatusByError(nonExistRPCReqIdError);
            throw nonExistRPCReqIdError;
        }

        if (!this._isPlainObject(advancedOptions) && typeof (advancedOptions) !== 'undefined') {
            const invalidParamError = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(invalidParamError);
            throw invalidParamError;
        }

        let mode;
        if (this._isPlainObject(advancedOptions) && Object.hasOwnProperty.call(advancedOptions, 'mode')) {
            if (!['skip', 'kill', 'killnowait'].includes(advancedOptions.mode)) {
                const error = new Errors.InvalidParamError('mode');
                this._fillOpStatusByError(error);
                throw error;
            }
            mode = advancedOptions.mode;
        }

        // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]
        this._send([WAMP_MSG_SPEC.CANCEL, reqId, { mode }]);
        this._cache.opStatus = { ...SUCCESS, reqId: reqId };

        return true;
    }

    /**
     * RPC registration for invocation
     * @param {string} topic
     * @param {function} rpc - rpc that will receive invocations
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          {
     *                              match: string matching policy ("exact"|"prefix"|"wildcard")
     *                              invoke: string invocation policy ("single"|"roundrobin"|"random"|"first"|"last")
     *                          }
     * @returns {Promise}
     */
    async register (topic, rpc, advancedOptions) {
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

        const { match, invoke } = advancedOptions || {};
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
        const callbacks = getNewPromise();
        const options = {
            ... (match ? { match } : {}),
            ... (invoke ? { invoke } : {}),
        };

        if (rpc) {
            callbacks.rpc = rpc;
        }

        this._requests[reqId] = { topic, callbacks };

        // WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]
        this._send([WAMP_MSG_SPEC.REGISTER, reqId, options, topic]);
        this._cache.opStatus = { ...SUCCESS, reqId };

        return callbacks.promise;
    }

    /**
     * RPC unregistration for invocation
     * @param {string} topic - a topic URI to unregister
     * @returns {Promise}
     */
    async unregister (topic) {
        if (!this._preReqChecks({ topic, patternBased: false, allowWAMP: false }, 'dealer')) {
            throw this._cache.opStatus.error;
        }

        if (!this._rpcRegs[topic]) {
            const nonExistRpcUnregistrationError = new Errors.NonExistRPCUnregistrationError();
            this._fillOpStatusByError(nonExistRpcUnregistrationError);
            throw nonExistRpcUnregistrationError;
        }

        const reqId = this._getReqId();
        const callbacks = getNewPromise();

        this._requests[reqId] = { topic, callbacks };

        // WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]
        this._send([WAMP_MSG_SPEC.UNREGISTER, reqId, this._rpcRegs[topic].id]);
        this._cache.opStatus = { ...SUCCESS, reqId };

        return callbacks.promise;
    }
}

export default Wampy;
export { Wampy, Errors };
