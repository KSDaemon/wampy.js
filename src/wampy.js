/**
 * Project: wampy.js
 *
 * https://github.com/KSDaemon/wampy.js
 *
 * A lightweight client-side implementation of
 * WAMP (The WebSocket Application Messaging Protocol v2)
 * http://wamp.ws
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
        this.version = 'v7.0.0-rc3';

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
         * Stored Pub/Sub
         * @type {object}
         * @private
         */
        this._subscriptions = {};

        /**
         * Stored Pub/Sub topics
         * @type {Set}
         * @private
         */
        this._subsTopics = new Set();

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
             * User provided additional HTTP headers (for use in Node.js enviroment)
             * @type {object}
             */
            additionalHeaders: null,

            /**
             * User provided WS Client Config Options (for use in Node.js enviroment)
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
            this._options = this._merge(this._options, options);
        } else if (this._isPlainObject(url)) {
            this._options = this._merge(this._options, url);
        }

    }

    /* Internal utils methods */
    /**
     * Internal logger
     * @private
     */
    _log (...args) {
        if (this._options.debug) {
            if (this._options.logger) {
                this._options.logger(args);
            } else {
                console.log('[wampy]', args);
            }
        }
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
     * Merge argument objects into one
     * @returns {Object}
     * @private
     */
    _merge (...args) {
        const obj = {}, l = args.length;
        let i, attr;

        for (i = 0; i < l; i++) {
            for (attr in args[i]) {
                obj[attr] = args[i][attr];
            }
        }
        return obj;
    }

    /**
     * Check if value is array
     * @param obj
     * @returns {boolean}
     * @private
     */
    _isArray (obj) {
        return (!!obj) && (Array.isArray(obj));
    }

    /**
     * Check if value is object literal
     * @param obj
     * @returns {boolean}
     * @private
     */
    _isPlainObject (obj) {
        if (!this._isObject(obj)) {
            return false;
        }

        // If obj has modified constructor
        const ctor = obj.constructor;
        if (typeof ctor !== 'function') {
            return false;
        }

        // If obj has modified prototype
        const prot = ctor.prototype;
        if (this._isObject(prot) === false) {
            return false;
        }

        // If constructor does not have an Object-specific method
        return Object.hasOwnProperty.call(prot, 'isPrototypeOf') !== false;
    }

    /**
     * Check if value is an object
     * @param obj
     * @returns {boolean}
     * @private
     */
    _isObject (obj) {
        return obj !== null
            && typeof obj === 'object'
            && Array.isArray(obj) === false
            && Object.prototype.toString.call(obj) === '[object Object]';
    }

    /**
     * Set websocket protocol based on options
     * @private
     */
    _setWsProtocols () {
        if (!(this._options.serializer instanceof JsonSerializer)) {
            this._protocols.unshift('wamp.2.' + this._options.serializer.protocol);
        }
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
        let err;

        if (this._cache.sessionId && !this._cache.server_wamp_features.roles[role]) {
            switch (role) {
                case 'dealer':
                    err = new Errors.NoDealerError();
                    break;
                case 'broker':
                    err = new Errors.NoBrokerError();
                    break;
            }
            this._fillOpStatusByError(err);
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
        return this._cache.server_wamp_features.roles[role].features[feature] === true;
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
     * @param {boolean} patternBased
     * @param {boolean} allowWAMP
     * @returns {boolean}
     * @private
     */
    _validateURI (uri, patternBased, allowWAMP) {
        let reBase;
        let rePattern;

        if (this._options.uriValidation === 'strict') {
            reBase = /^([0-9a-zA-Z_]+\.)*([0-9a-zA-Z_]+)$/;
            rePattern = /^([0-9a-zA-Z_]+\.{1,2})*([0-9a-zA-Z_]+)$/;
        } else if (this._options.uriValidation === 'loose') {
            reBase = /^([^\s.#]+\.)*([^\s.#]+)$/;
            rePattern = /^([^\s.#]+\.{1,2})*([^\s.#]+)$/;
        } else {
            return false;
        }
        const re = patternBased ? rePattern : reBase;

        if (allowWAMP) {
            return re.test(uri);
        } else {
            return !(!re.test(uri) || uri.indexOf('wamp.') === 0);
        }
    }

    /**
     * Prepares PPT/E2EE payload for adding to WAMP message
     * @param {string|number|Array|object} payload
     * @param {Object} options
     * @returns {Object}
     * @private
     */
    _packPPTPayload (payload, options) {
        let payloadItems = [], err = false, argsList, argsDict;

        if (this._isArray(payload)) {
            argsList = payload;
        } else if (this._isPlainObject(payload)) {
            // It's a wampy unified form of payload passing
            if (payload.argsList || payload.argsDict) {
                if (this._isArray(payload.argsList)) {
                    argsList = payload.argsList;
                } else if (typeof (payload.argsList) !== 'undefined') {
                    argsList = [payload.argsList];
                }

                if (payload.argsDict) {
                    argsDict = payload.argsDict;
                }
            } else {
                argsDict = payload;
            }
        } else {    // assume it's a single value
            argsList = [payload];
        }

        // Check and handle Payload PassThru Mode
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
        if (options.ppt_scheme) {
            let binPayload, pptPayload = { args: argsList, kwargs: argsDict };

            if (options.ppt_serializer && options.ppt_serializer !== 'native') {
                let pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

                if (!pptSerializer) {
                    err = true;
                    this._fillOpStatusByError(new Errors.PPTSerializerInvalidError());
                    return { err, payloadItems };
                }

                try {
                    binPayload = pptSerializer.encode(pptPayload);
                } catch (e) {
                    err = true;
                    this._fillOpStatusByError(new Errors.PPTSerializationError());
                    return { err, payloadItems };
                }
            } else {
                binPayload = pptPayload;
            }

            // wamp scheme means Payload End-to-End Encryption
            // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
            if (options.ppt_scheme === 'wamp') {

                // TODO: implement End-to-End Encryption
            }

            payloadItems.push([binPayload]);

        } else {
            if (argsList) {
                payloadItems.push(argsList);
            }
            if (argsDict) {
                if (!argsList) {
                    payloadItems.push([]);
                }
                payloadItems.push(argsDict);
            }
        }

        return { err, payloadItems };
    }

    /**
     * Unpack PPT/E2EE payload to common
     * @param {string} role
     * @param {Array} pptPayload
     * @param {Object} options
     * @returns {Object}
     * @private
     */
    async _unpackPPTPayload (role, pptPayload, options) {
        let err = false, decodedPayload;

        if (!this._checkPPTOptions(role, options)) {
            return { err: this._cache.opStatus.error };
        }

        // wamp scheme means Payload End-to-End Encryption
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
        if (options.ppt_scheme === 'wamp') {

            // TODO: implement End-to-End Encryption

        }

        if (options.ppt_serializer && options.ppt_serializer !== 'native') {
            let pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

            if (!pptSerializer) {
                return { err: new Errors.PPTSerializerInvalidError() };
            }

            try {
                decodedPayload = await pptSerializer.decode(pptPayload);
            } catch (e) {
                return { err: new Errors.PPTSerializationError() };
            }
        } else {
            decodedPayload = pptPayload;
        }
        return { err, args: decodedPayload.args, kwargs: decodedPayload.kwargs };
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
            this._hardClose('wamp.error.protocol_violation', 'Can not encode message');
        }
    }

    /**
     * Decode WAMP message
     * @param  msg
     * @returns {Promise}
     * @private
     */
    _decode (msg) {
        return this._options.serializer.decode(msg);
    }

    /**
     * Hard close of connection due to protocol violations
     * @param {string} errorUri
     * @param {string} details
     * @private
     */
    _hardClose (errorUri, details) {
        this._log(details);
        // Cleanup outgoing message queue
        this._wsQueue = [];
        this._send([WAMP_MSG_SPEC.ABORT, { message: details }, errorUri]);

        let err = new Errors.ProtocolViolationError(errorUri, details);

        // In case we were just making first connection
        if (this._cache.connectPromise) {
            this._cache.connectPromise.onError(err);
            this._cache.connectPromise = null;
        }

        if (this._options.onError) {
            this._options.onError(err);
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
     * Reset internal state and cache
     * @private
     */
    _resetState () {
        this._wsQueue = [];
        this._subscriptions = {};
        this._subsTopics = new Set();
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
        if (this._ws) {
            this._ws.onopen = () => {
                this._wsOnOpen();
            };
            this._ws.onclose = event => {
                this._wsOnClose(event);
            };
            this._ws.onmessage = event => {
                this._wsOnMessage(event);
            };
            this._ws.onerror = error => {
                this._wsOnError(error);
            };
        }
    }

    /**
     * Internal websocket on open callback
     * @private
     */
    _wsOnOpen () {
        const options = this._merge(this._options.helloCustomDetails, this._wamp_features),
            serverProtocol = this._ws.protocol ? this._ws.protocol.split('.')[2] : '';
        if (this._options.authid) {
            options.authmethods = this._options.authmethods;
            options.authid = this._options.authid;
            options.authextra = this._options.authextra;
        }

        this._log('websocket connected');

        if (this._options.serializer.protocol !== serverProtocol) {
            // Server have chosen not our preferred protocol

            // Falling back to json if possible
            // Temp hack for React Native Environment is removed as
            // (facebook/react-native#24796) was resolved
            if (serverProtocol === 'json') {
                this._options.serializer = new JsonSerializer();
            } else {
                let err = new Errors.NoSerializerAvailableError();
                this._fillOpStatusByError(err);

                if (this._cache.connectPromise) {
                    this._cache.connectPromise.onError(err);
                    this._cache.connectPromise = null;
                }

                if (this._options.onError) {
                    this._options.onError(err);
                }
            }
        }

        if (this._options.serializer.isBinary) {
            this._ws.binaryType = 'arraybuffer';
        }

        // WAMP SPEC: [HELLO, Realm|uri, Details|dict]
        // Sending directly 'cause it's a hello msg and no sessionId check is needed
        this._ws.send(this._encode([WAMP_MSG_SPEC.HELLO, this._options.realm, options]));
    }

    /**
     * Internal websocket on close callback
     * @param {object} event
     * @private
     */
    _wsOnClose (event) {
        this._log('websocket disconnected. Info: ', event);

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
            } else if (this._cache.closePromise) {
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
        let data;
        try {
            data = await this._decode(event.data);
        } catch (e) {
            this._hardClose('wamp.error.protocol_violation', 'Can not decode received message');
        }

        this._log('websocket message received: ', data);

        let id, i, p, self = this;

        switch (data[0]) {
            case WAMP_MSG_SPEC.WELCOME:
                // WAMP SPEC: [WELCOME, Session|id, Details|dict]
                if (this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received WELCOME message after session was established');
                } else {
                    this._cache.sessionId = data[1];
                    this._cache.server_wamp_features = data[2];

                    if (this._cache.reconnectingAttempts) {
                        // There was reconnection

                        this._cache.reconnectingAttempts = 0;

                        if (this._options.onReconnectSuccess) {
                            this._options.onReconnectSuccess(data[2]);
                        }

                        // Let's renew all previous state
                        this._renewSubscriptions();
                        this._renewRegistrations();

                    } else {
                        // Firing onConnect event on real connection to WAMP server
                        this._cache.connectPromise.onSuccess(data[2]);
                        this._cache.connectPromise = null;
                    }

                    // Send local queue if there is something out there
                    this._send();
                }
                break;
            case WAMP_MSG_SPEC.ABORT:
                // WAMP SPEC: [ABORT, Details|dict, Reason|uri]
                if (this._options.onError) {
                    this._options.onError(new Errors.AbortError({ error: data[2], details: data[1] }));
                }
                this._ws.close();
                break;
            case WAMP_MSG_SPEC.CHALLENGE:
                // WAMP SPEC: [CHALLENGE, AuthMethod|string, Extra|dict]
                if (this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received CHALLENGE message after session was established');
                    break;
                } else if (this._options.authid &&
                    this._options.authMode === 'manual' &&
                    typeof this._options.onChallenge === 'function') {

                    p = new Promise((resolve, reject) => {
                        resolve(this._options.onChallenge(data[1], data[2]));
                    });

                } else if (this._options.authid &&
                    this._options.authMode === 'auto' &&
                    typeof this._options.authPlugins[data[1]] === 'function') {

                    p = new Promise((resolve, reject) => {
                        resolve(this._options.authPlugins[data[1]](data[1], data[2]));
                    });

                } else {
                    let error = new Errors.NoCRACallbackOrIdError();

                    this._fillOpStatusByError(error);
                    this._ws.send(this._encode([
                        WAMP_MSG_SPEC.ABORT,
                        { message: error.message },
                        'wamp.error.cannot_authenticate'
                    ]));
                    if (this._options.onError) {
                        this._options.onError(error);
                    }
                    this._ws.close();
                    break;
                }

                p.then((key) => {

                    // Sending directly 'cause it's a challenge msg and no sessionId check is needed
                    this._ws.send(this._encode([WAMP_MSG_SPEC.AUTHENTICATE, key, {}]));

                }).catch(e => {
                    let error = new Errors.ChallengeExceptionError();

                    this._fillOpStatusByError(error);
                    this._ws.send(this._encode([
                        WAMP_MSG_SPEC.ABORT,
                        { message: error.message },
                        'wamp.error.cannot_authenticate'
                    ]));
                    if (this._options.onError) {
                        this._options.onError(error);
                    }
                    this._ws.close();
                });

                break;
            case WAMP_MSG_SPEC.GOODBYE:
                // WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received GOODBYE message before session was established');
                } else {
                    if (!this._cache.isSayingGoodbye) {    // get goodbye, initiated by server
                        this._cache.isSayingGoodbye = true;
                        this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.goodbye_and_out']);
                    }
                    this._cache.sessionId = null;
                    this._ws.close();
                }
                break;
            case WAMP_MSG_SPEC.ERROR:
                // WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict,
                //             Error|uri, (Arguments|list, ArgumentsKw|dict)]
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received ERROR message before session was established');
                } else {
                    let errData = {
                        error   : data[4],
                        details : data[3],
                        argsList: data[5],
                        argsDict: data[6]
                    };

                    switch (data[1]) {
                        case WAMP_MSG_SPEC.SUBSCRIBE:

                            this._requests[data[2]] && this._requests[data[2]].callbacks.onError &&
                            this._requests[data[2]].callbacks.onError(new Errors.SubscribeError(errData));
                            delete this._requests[data[2]];

                            break;
                        case WAMP_MSG_SPEC.UNSUBSCRIBE:

                            this._requests[data[2]] && this._requests[data[2]].callbacks.onError &&
                            this._requests[data[2]].callbacks.onError(new Errors.UnsubscribeError(errData));
                            delete this._requests[data[2]];

                            break;
                        case WAMP_MSG_SPEC.PUBLISH:

                            this._requests[data[2]] && this._requests[data[2]].callbacks.onError &&
                            this._requests[data[2]].callbacks.onError(new Errors.PublishError(errData));
                            delete this._requests[data[2]];

                            break;
                        case WAMP_MSG_SPEC.REGISTER:

                            this._requests[data[2]] && this._requests[data[2]].callbacks.onError &&
                            this._requests[data[2]].callbacks.onError(new Errors.RegisterError(errData));
                            delete this._requests[data[2]];

                            break;
                        case WAMP_MSG_SPEC.UNREGISTER:

                            this._requests[data[2]] && this._requests[data[2]].callbacks.onError &&
                            this._requests[data[2]].callbacks.onError(new Errors.UnregisterError(errData));
                            delete this._requests[data[2]];

                            break;
                        // case WAMP_MSG_SPEC.INVOCATION:
                        //     break;
                        case WAMP_MSG_SPEC.CALL:

                            // WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict,
                            //             Error|uri, Arguments|list, ArgumentsKw|dict]
                            this._calls[data[2]] && this._calls[data[2]].onError &&
                            this._calls[data[2]].onError(new Errors.CallError(errData));
                            delete this._calls[data[2]];

                            break;
                        default:
                            this._hardClose('wamp.error.protocol_violation', 'Received invalid ERROR message');
                            break;
                    }
                }
                break;
            case WAMP_MSG_SPEC.SUBSCRIBED:
                // WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received SUBSCRIBED message before session was established');
                } else {
                    if (this._requests[data[1]]) {
                        this._subscriptions[this._requests[data[1]].topic] = this._subscriptions[data[2]] = {
                            id             : data[2],
                            callbacks      : [this._requests[data[1]].callbacks.onEvent],
                            advancedOptions: this._requests[data[1]].advancedOptions
                        };

                        this._subsTopics.add(this._requests[data[1]].topic);

                        if (this._requests[data[1]].callbacks.onSuccess) {
                            this._requests[data[1]].callbacks.onSuccess({
                                topic         : this._requests[data[1]].topic,
                                requestId     : data[1],
                                subscriptionId: data[2]
                            });
                        }

                        delete this._requests[data[1]];

                    }
                }
                break;
            case WAMP_MSG_SPEC.UNSUBSCRIBED:
                // WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received UNSUBSCRIBED message before session was established');
                } else {
                    if (this._requests[data[1]]) {
                        id = this._subscriptions[this._requests[data[1]].topic].id;
                        delete this._subscriptions[this._requests[data[1]].topic];
                        delete this._subscriptions[id];

                        if (this._subsTopics.has(this._requests[data[1]].topic)) {
                            this._subsTopics.delete(this._requests[data[1]].topic);
                        }

                        if (this._requests[data[1]].callbacks.onSuccess) {
                            this._requests[data[1]].callbacks.onSuccess({
                                topic    : this._requests[data[1]].topic,
                                requestId: data[1]
                            });
                        }

                        delete this._requests[data[1]];
                    }
                }
                break;
            case WAMP_MSG_SPEC.PUBLISHED:
                // WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received PUBLISHED message before session was established');
                } else {
                    if (this._requests[data[1]]) {
                        if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                            this._requests[data[1]].callbacks.onSuccess({
                                topic        : this._requests[data[1]].topic,
                                requestId    : data[1],
                                publicationId: data[2]
                            });
                        }

                        delete this._requests[data[1]];
                    }
                }
                break;
            case WAMP_MSG_SPEC.EVENT:
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received EVENT message before session was established');
                } else {
                    if (this._subscriptions[data[1]]) {
                        let argsList, argsDict, options = data[3];

                        // WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id,
                        //             Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]

                        // Check and handle Payload PassThru Mode
                        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
                        if (options.ppt_scheme) {
                            let decodedPayload, pptPayload = data[4][0];

                            decodedPayload = await this._unpackPPTPayload('broker', pptPayload, options);

                            if (decodedPayload.err) {
                                // Since it is async publication, and no link to
                                // original publication - as it was already published
                                // we can not reply with error, only log it.
                                // Although the router should handle it
                                this._log(decodedPayload.err.message);
                                break;
                            }

                            argsList = decodedPayload.args;
                            argsDict = decodedPayload.kwargs;

                        } else {
                            argsList = data[4];
                            argsDict = data[5];
                        }

                        i = this._subscriptions[data[1]].callbacks.length;
                        while (i--) {
                            this._subscriptions[data[1]].callbacks[i]({
                                details : options,
                                argsList: argsList,
                                argsDict: argsDict
                            });
                        }
                    }
                }
                break;
            case WAMP_MSG_SPEC.RESULT:
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received RESULT message before session was established');
                } else {
                    if (this._calls[data[1]]) {
                        let argsList, argsDict, options = data[2];

                        // WAMP SPEC: [RESULT, CALL.Request|id, Details|dict,
                        //             YIELD.Arguments|list, YIELD.ArgumentsKw|dict]

                        // Check and handle Payload PassThru Mode
                        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
                        if (options.ppt_scheme) {
                            let decodedPayload, pptPayload = data[3][0];

                            decodedPayload = await this._unpackPPTPayload('dealer', pptPayload, options);

                            if (decodedPayload.err) {
                                this._log(decodedPayload.err.message);
                                this._cache.opStatus = decodedPayload.err;
                                this._calls[data[1]].onError(new Errors.CallError({
                                    error     : 'wamp.error.invocation_exception',
                                    details   : data[2],
                                    argsList  : [decodedPayload.err.message],
                                    argsDict  : null
                                }));
                                delete this._calls[data[1]];
                                break;
                            }

                            argsList = decodedPayload.args;
                            argsDict = decodedPayload.kwargs;

                        } else {
                            argsList = data[3];
                            argsDict = data[4];
                        }

                        if (options.progress === true) {
                            this._calls[data[1]].onProgress({
                                details : options,
                                argsList: argsList,
                                argsDict: argsDict
                            });
                        } else {
                            // We received final result (progressive or not)
                            this._calls[data[1]].onSuccess({
                                details : options,
                                argsList: argsList,
                                argsDict: argsDict
                            });
                            delete this._calls[data[1]];
                        }
                    }
                }
                break;
            // case WAMP_MSG_SPEC.REGISTER:
            //     // WAMP SPEC:
            //     break;
            case WAMP_MSG_SPEC.REGISTERED:
                // WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received REGISTERED message before session was established');
                } else {
                    if (this._requests[data[1]]) {
                        this._rpcRegs[this._requests[data[1]].topic] = this._rpcRegs[data[2]] = {
                            id       : data[2],
                            callbacks: [this._requests[data[1]].callbacks.rpc]
                        };

                        this._rpcNames.add(this._requests[data[1]].topic);

                        if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                            this._requests[data[1]].callbacks.onSuccess({
                                topic         : this._requests[data[1]].topic,
                                requestId     : data[1],
                                registrationId: data[2]
                            });
                        }

                        delete this._requests[data[1]];
                    }
                }
                break;
            // case WAMP_MSG_SPEC.UNREGISTER:
            //     // WAMP SPEC:
            //     break;
            case WAMP_MSG_SPEC.UNREGISTERED:
                // WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received UNREGISTERED message before session was established');
                } else {
                    if (this._requests[data[1]]) {
                        id = this._rpcRegs[this._requests[data[1]].topic].id;
                        delete this._rpcRegs[this._requests[data[1]].topic];
                        delete this._rpcRegs[id];

                        if (this._rpcNames.has(this._requests[data[1]].topic)) {
                            this._rpcNames.delete(this._requests[data[1]].topic);
                        }

                        if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                            this._requests[data[1]].callbacks.onSuccess({
                                topic    : this._requests[data[1]].topic,
                                requestId: data[1]
                            });
                        }

                        delete this._requests[data[1]];
                    }
                }
                break;
            case WAMP_MSG_SPEC.INVOCATION:
                if (!this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received INVOCATION message before session was established');
                } else {
                    if (this._rpcRegs[data[2]]) {
                        let argsList, argsDict, options = data[3];

                        // WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id,
                        //             Details|dict, CALL.Arguments|list, CALL.ArgumentsKw|dict]

                        let invoke_error_handler = ({ details, error, argsList, argsDict }) => {
                                let msg = [WAMP_MSG_SPEC.ERROR, WAMP_MSG_SPEC.INVOCATION,
                                    data[1], details || {}, error || 'wamp.error.invocation_exception'];

                                if (argsList && self._isArray(argsList)) {
                                    msg.push(argsList);
                                }

                                if (argsDict && self._isPlainObject(argsDict)) {
                                    if (msg.length === 5) {
                                        msg.push([]);
                                    }
                                    msg.push(argsDict);
                                }
                                self._send(msg);
                            },
                            invoke_result_handler = results => {
                                // WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, (Arguments|list,
                                // ArgumentsKw|dict)]
                                let msg = [WAMP_MSG_SPEC.YIELD, data[1], {}];

                                if (self._isPlainObject(results)) {

                                    if (self._isPlainObject(results.options)) {
                                        let options = results.options;

                                        // Check and handle Payload PassThru Mode
                                        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
                                        let pptScheme = results.options.ppt_scheme;

                                        if (pptScheme) {
                                            if (!this._checkPPTOptions('dealer', results.options)) {
                                                if (this._cache.opStatus.error && this._cache.opStatus.error instanceof Errors.PPTNotSupportedError) {
                                                    // This case should not happen at all, but for safety
                                                    this._hardClose('wamp.error.protocol_violation', 'Trying to send YIELD in PPT Mode, while Dealer didn\'t announce it');
                                                } else {
                                                    invoke_error_handler({
                                                        details : results.options,
                                                        error   : 'wamp.error.invalid_option',
                                                        argsList: [this._cache.opStatus.error.message],
                                                        argsDict: null
                                                    });
                                                }
                                                return;
                                            }

                                            options.ppt_scheme = pptScheme;

                                            if (results.options.ppt_serializer) {
                                                options.ppt_serializer = results.options.ppt_serializer;
                                            }
                                            if (results.options.ppt_cipher) {
                                                options.ppt_cipher = results.options.ppt_cipher;
                                            }
                                            if (results.options.ppt_keyid) {
                                                options.ppt_keyid = results.options.ppt_keyid;
                                            }
                                        }

                                        msg[2] = options;
                                    }

                                }

                                if (results !== null && typeof (results) !== 'undefined') {
                                    let res = this._packPPTPayload(results, results.options || {});

                                    if (res.err) {
                                        invoke_error_handler({
                                            details : results.options,
                                            error   : null, // will be default'ed to invocation_exception
                                            argsList: [this._cache.opStatus.error.message],
                                            argsDict: null
                                        });
                                        return;
                                    }
                                    msg = msg.concat(res.payloadItems);
                                }

                                self._send(msg);
                            };

                        // Check and handle Payload PassThru Mode
                        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
                        if (options.ppt_scheme) {
                            let decodedPayload, pptPayload = data[4][0];

                            decodedPayload = await this._unpackPPTPayload('dealer', pptPayload, options);

                            // This case should not happen at all, but for safety
                            if (decodedPayload.err && decodedPayload.err instanceof Errors.PPTNotSupportedError) {
                                this._log(decodedPayload.err.message);
                                this._hardClose('wamp.error.protocol_violation', 'Received INVOCATION in PPT Mode, while Dealer didn\'t announce it');
                                break;
                            } else if (decodedPayload.err) {

                                this._log(decodedPayload.err.message);
                                invoke_error_handler({
                                    details : data[3],
                                    error   : null, // will be default'ed to invocation_exception,
                                    argsList: [decodedPayload.err.message],
                                    argsDict: null
                                });
                                break;
                            }

                            argsList = decodedPayload.args;
                            argsDict = decodedPayload.kwargs;

                        } else {
                            argsList = data[4];
                            argsDict = data[5];
                        }

                        p = new Promise((resolve, reject) => {
                            resolve(this._rpcRegs[data[2]].callbacks[0]({
                                details       : options,
                                argsList      : argsList,
                                argsDict      : argsDict,
                                result_handler: invoke_result_handler,
                                error_handler : invoke_error_handler
                            }));
                        });

                        p.then((results) => {
                            invoke_result_handler(results);
                        }).catch(e => {
                            invoke_error_handler(e);
                        });

                    } else {
                        // WAMP SPEC: [ERROR, INVOCATION, INVOCATION.Request|id, Details|dict, Error|uri]
                        this._send([WAMP_MSG_SPEC.ERROR, WAMP_MSG_SPEC.INVOCATION,
                            data[1], {}, 'wamp.error.no_such_procedure']);
                        this._log(WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION);
                    }
                }
                break;
            // case WAMP_MSG_SPEC.INTERRUPT:
            //     // WAMP SPEC:
            //     break;
            // case WAMP_MSG_SPEC.YIELD:
            //     // WAMP SPEC:
            //     break;
            default:
                this._hardClose('wamp.error.protocol_violation', 'Received non-compliant WAMP message');
                break;
        }
    }

    /**
     * Internal websocket on error callback
     * @param {object} error
     * @private
     */
    _wsOnError (error) {
        this._log('websocket error');
        let err = new Errors.WebsocketError(error);

        if (this._cache.connectPromise) {
            this._cache.connectPromise.onError(err);
            this._cache.connectPromise = null;
        }

        if (this._options.onError) {
            this._options.onError(err);
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
        this._ws = getWebSocket(this._url, this._protocols, this._options.ws,
            this._options.additionalHeaders, this._options.wsRequestOptions);
        this._initWsCallbacks();
    }

    /**
     * Resubscribe to topics in case of communication error
     * @private
     */
    _renewSubscriptions () {
        let i;
        const subs = this._subscriptions,
            st = this._subsTopics;

        this._subscriptions = {};
        this._subsTopics = new Set();

        for (let topic of st) {
            i = subs[topic].callbacks.length;
            while (i--) {
                this.subscribe(topic, subs[topic].callbacks[i], subs[topic].advancedOptions);
            }
        }
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

        for (let rpcName of rn) {
            this.register(rpcName, rpcs[rpcName].callbacks[0]);
        }
    }

    /*************************************************************************
     * Wampy public API
     *************************************************************************/

    /**
     * Get or set Wampy options
     *
     * To get options - call without parameters
     * To set options - pass hash-table with options values
     *
     * @param {object} [opts]
     * @returns {*}
     */
    options (opts) {
        if (typeof (opts) === 'undefined') {
            return this._options;
        } else if (this._isPlainObject(opts)) {
            this._options = this._merge(this._options, opts);
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
        let error;

        if (url) {
            this._url = url;
        }

        if (this._options.realm) {

            const authOpts = (this._options.authid ? 1 : 0) +
                ((this._isArray(this._options.authmethods) && this._options.authmethods.length) ? 1 : 0) +
                (typeof this._options.onChallenge === 'function' ||
                 Object.keys(this._options.authPlugins).length ? 1 : 0);

            if (authOpts > 0 && authOpts < 3) {
                error = new Errors.NoCRACallbackOrIdError();
                this._fillOpStatusByError(error);
                throw error;
            }

            this._setWsProtocols();
            this._ws = getWebSocket(this._url, this._protocols, this._options.ws,
                this._options.additionalHeaders, this._options.wsRequestOptions);
            if (!this._ws) {
                error = new Errors.NoWsOrUrlError();
                this._fillOpStatusByError(error);
                throw error;
            }
            this._initWsCallbacks();

        } else {
            error = new Errors.NoRealmError();
            this._fillOpStatusByError(error);
            throw error;
        }

        let defer = getNewPromise();
        this._cache.connectPromise = defer;
        return defer.promise;
    }

    /**
     * Disconnect from server
     * @returns {Promise}
     */
    async disconnect () {
        if (this._cache.sessionId) {
            let defer = getNewPromise();
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
     * @param {string} topicURI
     * @param {function} onEvent - received event callback
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { match: string matching policy ("prefix"|"wildcard") }
     *
     * @returns {Promise}
     */
    async subscribe (topicURI, onEvent, advancedOptions) {
        let reqId, patternBased = false;
        const options = {}, callbacks = getNewPromise();

        if (this._isPlainObject(advancedOptions)) {
            if (Object.prototype.hasOwnProperty.call(advancedOptions, 'match')) {
                if (/prefix|wildcard/.test(advancedOptions.match)) {
                    options.match = advancedOptions.match;
                    patternBased = true;
                } else {
                    let error = new Errors.InvalidParamError('match');
                    this._fillOpStatusByError(error);
                    throw error;
                }
            }
        } else if (typeof (advancedOptions) !== 'undefined') {
            let error = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(error);
            throw error;
        }

        // Need to be placed here as patternBased flag is determined above
        if (!this._preReqChecks({ topic: topicURI, patternBased: patternBased, allowWAMP: true },
            'broker')) {
            throw this._cache.opStatus.error;
        }

        if (typeof onEvent === 'function') {
            callbacks.onEvent = onEvent;
        } else {
            let error = new Errors.NoCallbackError();
            this._fillOpStatusByError(error);
            throw error;
        }

        if (!this._subscriptions[topicURI] || !this._subscriptions[topicURI].callbacks.length) {
            // no such subscription or processing unsubscribing

            reqId = this._getReqId();

            this._requests[reqId] = {
                topic: topicURI,
                callbacks,
                advancedOptions
            };

            // WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
            this._send([WAMP_MSG_SPEC.SUBSCRIBE, reqId, options, topicURI]);

        } else {    // already have subscription to this topic
            // There is no such callback yet
            if (this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent) < 0) {
                this._subscriptions[topicURI].callbacks.push(callbacks.onEvent);
            }

            return {
                topic: topicURI,
                subscriptionId: this._subscriptions[topicURI].id
            };
        }

        this._cache.opStatus = SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return callbacks.promise;
    }

    /**
     * Unsubscribe from topic
     * @param {string} topicURI
     * @param {function} [onEvent] - received event callback to remove (optional). If not provided -
     *                               all callbacks will be removed and unsubscribed on the server
     * @returns {Promise}
     */
    async unsubscribe (topicURI, onEvent) {
        let reqId;
        const callbacks = getNewPromise();

        if (!this._preReqChecks(null, 'broker')) {
            throw this._cache.opStatus.error;
        }

        if (this._subscriptions[topicURI]) {

            reqId = this._getReqId();

            if (typeof onEvent === 'function') {
                let i = this._subscriptions[topicURI].callbacks.indexOf(onEvent);
                if (i >= 0) {
                    this._subscriptions[topicURI].callbacks.splice(i, 1);
                }
            } else {
                this._subscriptions[topicURI].callbacks = [];
            }

            if (this._subscriptions[topicURI].callbacks.length) {
                // There are another callbacks for this topic
                this._cache.opStatus = SUCCESS;
                return true;
            }

            this._requests[reqId] = {
                topic: topicURI,
                callbacks
            };

            // WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]
            this._send([WAMP_MSG_SPEC.UNSUBSCRIBE, reqId, this._subscriptions[topicURI].id]);

        } else {
            let error = new Errors.NonExistUnsubscribeError();
            this._fillOpStatusByError(error);
            throw error;
        }

        this._cache.opStatus = SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return callbacks.promise;
    }

    /**
     * Publish an event to the topic
     * @param {string} topicURI
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
    async publish (topicURI, payload, advancedOptions) {
        let reqId, msg;
        const options = { acknowledge: true }, callbacks = getNewPromise(),
            _optionsConvertHelper = (option, sourceType) => {
                if (advancedOptions[option]) {
                    if (this._isArray(advancedOptions[option]) && advancedOptions[option].length) {
                        options[option] = advancedOptions[option];
                    } else if (typeof advancedOptions[option] === sourceType) {
                        options[option] = [advancedOptions[option]];
                    } else {
                        return false;
                    }
                }

                return true;
            };

        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: false }, 'broker')) {
            throw this._cache.opStatus.error;
        }

        if (this._isPlainObject(advancedOptions)) {
            if (!_optionsConvertHelper('exclude', 'number') ||
                !_optionsConvertHelper('exclude_authid', 'string') ||
                !_optionsConvertHelper('exclude_authrole', 'string') ||
                !_optionsConvertHelper('eligible', 'number') ||
                !_optionsConvertHelper('eligible_authid', 'string') ||
                !_optionsConvertHelper('eligible_authrole', 'string')) {

                let error = new Errors.InvalidParamError('advancedOptions');
                this._fillOpStatusByError(error);
                throw error;
            }

            if (Object.hasOwnProperty.call(advancedOptions, 'exclude_me')) {
                options.exclude_me = advancedOptions.exclude_me !== false;
            }

            if (Object.hasOwnProperty.call(advancedOptions, 'disclose_me')) {
                options.disclose_me = advancedOptions.disclose_me === true;
            }

            // Check and handle Payload PassThru Mode
            // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
            let pptScheme = advancedOptions.ppt_scheme;

            if (pptScheme) {
                if (!this._checkPPTOptions('broker', advancedOptions)) {
                    throw this._cache.opStatus.error;
                }

                options.ppt_scheme = pptScheme;

                if (advancedOptions.ppt_serializer) {
                    options.ppt_serializer = advancedOptions.ppt_serializer;
                }
                if (advancedOptions.ppt_cipher) {
                    options.ppt_cipher = advancedOptions.ppt_cipher;
                }
                if (advancedOptions.ppt_keyid) {
                    options.ppt_keyid = advancedOptions.ppt_keyid;
                }
            }

        } else if (typeof (advancedOptions) !== 'undefined') {
            let error = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(error);
            throw error;
        }

        reqId = this._getReqId();

        this._requests[reqId] = {
            topic: topicURI,
            callbacks
        };

        // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri]
        msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI];

        if (arguments.length > 1) {
            // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
            let res = this._packPPTPayload(payload, options);

            if (res.err) {
                throw this._cache.opStatus.error;
            }
            msg = msg.concat(res.payloadItems);
        }

        this._send(msg);
        this._cache.opStatus = SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return callbacks.promise;
    }

    /**
     * Remote Procedure Call
     * @param {string} topicURI
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
    async call (topicURI, payload, advancedOptions) {
        let reqId, msg;
        const options = {}, callbacks = getNewPromise();

        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: true }, 'dealer')) {
            throw this._cache.opStatus.error;
        }

        if (this._isPlainObject(advancedOptions)) {
            if (Object.hasOwnProperty.call(advancedOptions, 'disclose_me')) {
                options.disclose_me = advancedOptions.disclose_me === true;
            }

            if (Object.hasOwnProperty.call(advancedOptions, 'progress_callback')) {
                if (typeof advancedOptions.progress_callback === 'function') {
                    options.receive_progress = true;
                    callbacks.onProgress = advancedOptions.progress_callback;
                } else {
                    let error = new Errors.InvalidParamError('progress_callback');
                    this._fillOpStatusByError(error);
                    throw error;
                }
            }

            if (Object.hasOwnProperty.call(advancedOptions, 'timeout')) {
                if (typeof advancedOptions.timeout === 'number') {
                    options.timeout = advancedOptions.timeout;
                } else {
                    let error = new Errors.InvalidParamError('timeout');
                    this._fillOpStatusByError(error);
                    throw error;
                }
            }

            // Check and handle Payload PassThru Mode
            // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
            let pptScheme = advancedOptions.ppt_scheme;

            if (pptScheme) {
                if (!this._checkPPTOptions('dealer', advancedOptions)) {
                    throw this._cache.opStatus.error;
                }

                options.ppt_scheme = pptScheme;

                if (advancedOptions.ppt_serializer) {
                    options.ppt_serializer = advancedOptions.ppt_serializer;
                }
                if (advancedOptions.ppt_cipher) {
                    options.ppt_cipher = advancedOptions.ppt_cipher;
                }
                if (advancedOptions.ppt_keyid) {
                    options.ppt_keyid = advancedOptions.ppt_keyid;
                }
            }
        } else if (typeof (advancedOptions) !== 'undefined') {
            let error = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(error);
            throw error;
        }

        do {
            reqId = this._getReqId();
        } while (reqId in this._calls);

        this._calls[reqId] = callbacks;

        // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
        msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI];

        if (payload !== null && typeof (payload) !== 'undefined') {
            let res = this._packPPTPayload(payload, options);

            if (res.err) {
                throw this._cache.opStatus.error;
            }
            msg = msg.concat(res.payloadItems);
        }

        this._send(msg);
        this._cache.opStatus = SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return callbacks.promise;
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
        const options = {};

        if (!this._preReqChecks(null, 'dealer')) {
            throw this._cache.opStatus.error;
        }

        if (!reqId || !this._calls[reqId]) {
            let error = new Errors.NonExistRPCReqIdError();
            this._fillOpStatusByError(error);
            throw error;
        }

        if (this._isPlainObject(advancedOptions)) {
            if (Object.hasOwnProperty.call(advancedOptions, 'mode')) {
                if (/skip|kill|killnowait/.test(advancedOptions.mode)) {
                    options.mode = advancedOptions.mode;
                } else {
                    let error = new Errors.InvalidParamError('mode');
                    this._fillOpStatusByError(error);
                    throw error;
                }
            }
        } else if (typeof (advancedOptions) !== 'undefined') {
            let error = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(error);
            throw error;
        }

        // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]
        this._send([WAMP_MSG_SPEC.CANCEL, reqId, options]);
        this._cache.opStatus = SUCCESS;
        this._cache.opStatus.reqId = reqId;

        return true;
    }

    /**
     * RPC registration for invocation
     * @param {string} topicURI
     * @param {function} rpc - rpc that will receive invocations
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          {
     *                              match: string matching policy ("prefix"|"wildcard")
     *                              invoke: string invocation policy ("single"|"roundrobin"|"random"|"first"|"last")
     *                          }
     * @returns {Promise}
     */
    async register (topicURI, rpc, advancedOptions) {
        let reqId, patternBased = false;
        const options = {}, callbacks = getNewPromise();

        if (this._isPlainObject(advancedOptions)) {
            if (Object.hasOwnProperty.call(advancedOptions, 'match')) {
                if (/prefix|wildcard/.test(advancedOptions.match)) {
                    options.match = advancedOptions.match;
                    patternBased = true;
                } else {
                    let error = new Errors.InvalidParamError('match');
                    this._fillOpStatusByError(error);
                    throw error;
                }
            }

            if (Object.hasOwnProperty.call(advancedOptions, 'invoke')) {
                if (/single|roundrobin|random|first|last/.test(advancedOptions.invoke)) {
                    options.invoke = advancedOptions.invoke;
                } else {
                    let error = new Errors.InvalidParamError('invoke');
                    this._fillOpStatusByError(error);
                    throw error;
                }
            }

        } else if (typeof (advancedOptions) !== 'undefined') {
            let error = new Errors.InvalidParamError('advancedOptions');
            this._fillOpStatusByError(error);
            throw error;
        }

        // Need to be placed here as patternBased flag is determined above
        if (!this._preReqChecks({ topic: topicURI, patternBased: patternBased, allowWAMP: false },
            'dealer')) {
            throw this._cache.opStatus.error;
        }

        if (typeof rpc === 'function') {
            callbacks.rpc = rpc;
        } else {
            let error = new Errors.NoCallbackError();
            this._fillOpStatusByError(error);
            throw error;
        }

        if (!this._rpcRegs[topicURI] || !this._rpcRegs[topicURI].callbacks.length) {
            // no such registration or processing unregistering

            reqId = this._getReqId();

            this._requests[reqId] = {
                topic: topicURI,
                callbacks
            };

            // WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]
            this._send([WAMP_MSG_SPEC.REGISTER, reqId, options, topicURI]);
            this._cache.opStatus = SUCCESS;
            this._cache.opStatus.reqId = reqId;
        } else {    // already have registration with such topicURI
            let error = new Errors.RPCAlreadyRegisteredError();
            this._fillOpStatusByError(error);
            throw error;
        }

        return callbacks.promise;
    }

    /**
     * RPC unregistration for invocation
     * @param {string} topicURI
     * @returns {Promise}
     */
    async unregister (topicURI) {
        let reqId;
        const callbacks = getNewPromise();

        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: false }, 'dealer')) {
            throw this._cache.opStatus.error;        }

        if (this._rpcRegs[topicURI]) {   // there is such registration

            reqId = this._getReqId();

            this._requests[reqId] = {
                topic: topicURI,
                callbacks
            };

            // WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]
            this._send([WAMP_MSG_SPEC.UNREGISTER, reqId, this._rpcRegs[topicURI].id]);
            this._cache.opStatus = SUCCESS;
            this._cache.opStatus.reqId = reqId;
        } else {    // there is no registration with such topicURI
            let error = new Errors.NonExistRPCUnregistrationError();
            this._fillOpStatusByError(error);
            throw error;
        }

        return callbacks.promise;
    }
}

export default Wampy;
export { Wampy, Errors };
