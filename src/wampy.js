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

import { WAMP_MSG_SPEC, WAMP_ERROR_MSG, E2EE_SERIALIZERS } from './constants.js';
import { getWebSocket } from './utils.js';
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
        this.version = 'v6.5.0';

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
            opStatus: { code: 0, description: 'Success!', reqId: 0 },

            /**
             * Timer for reconnection
             * @type {null}
             */
            timer: null,

            /**
             * Reconnection attempts
             * @type {number}
             */
            reconnectingAttempts: 0
        };

        /**
         * WebSocket object
         * @type {Object}
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
             * onChallenge callback
             * @type {function}
             */
            onChallenge: null,

            /**
             * onConnect callback
             * @type {function}
             */
            onConnect: null,

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

        if (this._url) {
            this.connect();
        }

    }

    /* Internal utils methods */
    /**
     * Internal logger
     * @private
     */
    _log (...args) {
        if (this._options.debug) {
            console.log('[wampy]', args);
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
     * Fix websocket protocols based on options
     * @private
     */
    _setWsProtocols () {
        this._protocols = ['wamp.2.' + this._options.serializer.protocol];
    }

    /**
     * Prerequisite checks for any wampy api call
     * @param {object} topicType { topic: URI, patternBased: true|false, allowWAMP: true|false }
     * @param {string} role
     * @param {object} callbacks
     * @returns {boolean}
     * @private
     */
    _preReqChecks (topicType, role, callbacks) {
        let flag = true;

        if (this._cache.sessionId && !this._cache.server_wamp_features.roles[role]) {
            this._cache.opStatus = WAMP_ERROR_MSG['NO_' + role.toUpperCase()];
            flag = false;
        }

        if (topicType && !this._validateURI(topicType.topic, topicType.patternBased, topicType.allowWAMP)) {
            this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;
            flag = false;
        }

        if (flag) {
            return true;
        }

        if (this._isPlainObject(callbacks) && callbacks.onError) {
            callbacks.onError({ error: this._cache.opStatus.description });
        }

        return false;
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
            this._cache.opStatus = WAMP_ERROR_MSG.PPT_NOT_SUPPORTED;
            return false;
        }

        if (options.ppt_scheme.search(/^(wamp$|mqtt$|x_)/) < 0) {
            this._cache.opStatus = WAMP_ERROR_MSG.PPT_INVALID_SCHEME;
            return false;
        }

        if (options.ppt_scheme === 'wamp' && !E2EE_SERIALIZERS.includes(options.ppt_serializer)) {
            this._cache.opStatus = WAMP_ERROR_MSG.PPT_SRLZ_INVALID;
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
     * Prepares payload for adding to WAMP message
     * @param {string|number|Array|object} payload
     * @param {Object} options
     * @returns {Object}
     * @private
     */
    _preparePayload (payload, options) {
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
                    this._cache.opStatus = WAMP_ERROR_MSG.PPT_SRLZ_INVALID;
                    return { err, payloadItems };
                }

                try {
                    binPayload = pptSerializer.encode(pptPayload);
                } catch (e) {
                    err = true;
                    this._cache.opStatus = WAMP_ERROR_MSG.PPT_SRLZ_ERR;
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

        if (this._options.onError) {
            this._options.onError({ error: errorUri, details: details });
        }

        this._ws.close();
    }

    /**
     * Send encoded message to server
     * @param {Array|undefined} msg
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
            reconnectingAttempts: 0
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
                this._cache.opStatus = WAMP_ERROR_MSG.NO_SERIALIZER_AVAILABLE;
                return this;
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
                        if (this._options.onConnect) {
                            this._options.onConnect(data[2]);
                        }
                    }

                    // Send local queue if there is something out there
                    this._send();
                }
                break;
            case WAMP_MSG_SPEC.ABORT:
                // WAMP SPEC: [ABORT, Details|dict, Reason|uri]
                if (this._options.onError) {
                    this._options.onError({ error: data[2], details: data[1] });
                }
                this._ws.close();
                break;
            case WAMP_MSG_SPEC.CHALLENGE:
                // WAMP SPEC: [CHALLENGE, AuthMethod|string, Extra|dict]
                if (this._cache.sessionId) {
                    this._hardClose('wamp.error.protocol_violation',
                        'Received CHALLENGE message after session was established');
                } else {
                    if (this._options.authid && typeof this._options.onChallenge === 'function') {

                        p = new Promise((resolve, reject) => {
                            resolve(this._options.onChallenge(data[1], data[2]));
                        });

                        p.then((key) => {

                            // Sending directly 'cause it's a challenge msg and no sessionId check is needed
                            this._ws.send(this._encode([WAMP_MSG_SPEC.AUTHENTICATE, key, {}]));

                        }).catch(e => {
                            this._ws.send(this._encode([
                                WAMP_MSG_SPEC.ABORT,
                                { message: 'Exception in onChallenge handler raised!' },
                                'wamp.error.cannot_authenticate'
                            ]));
                            if (this._options.onError) {
                                this._options.onError({ error: WAMP_ERROR_MSG.CRA_EXCEPTION.description });
                            }
                            this._ws.close();
                            this._cache.opStatus = WAMP_ERROR_MSG.CRA_EXCEPTION;
                        });

                    } else {

                        this._ws.send(this._encode([
                            WAMP_MSG_SPEC.ABORT,
                            { message: WAMP_ERROR_MSG.NO_CRA_CB_OR_ID.description },
                            'wamp.error.cannot_authenticate'
                        ]));
                        if (this._options.onError) {
                            this._options.onError({ error: WAMP_ERROR_MSG.NO_CRA_CB_OR_ID.description });
                        }
                        this._ws.close();
                        this._cache.opStatus = WAMP_ERROR_MSG.NO_CRA_CB_OR_ID;

                    }
                }
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
                    switch (data[1]) {
                        case WAMP_MSG_SPEC.SUBSCRIBE:
                        case WAMP_MSG_SPEC.UNSUBSCRIBE:
                        case WAMP_MSG_SPEC.PUBLISH:
                        case WAMP_MSG_SPEC.REGISTER:
                        case WAMP_MSG_SPEC.UNREGISTER:

                            this._requests[data[2]] && this._requests[data[2]].callbacks.onError &&
                            this._requests[data[2]].callbacks.onError({
                                error   : data[4],
                                details : data[3],
                                argsList: data[5],
                                argsDict: data[6]
                            });
                            delete this._requests[data[2]];

                            break;
                        // case WAMP_MSG_SPEC.INVOCATION:
                        //     break;
                        case WAMP_MSG_SPEC.CALL:

                            // WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict,
                            //             Error|uri, Arguments|list, ArgumentsKw|dict]
                            this._calls[data[2]] && this._calls[data[2]].onError &&
                            this._calls[data[2]].onError({
                                error   : data[4],
                                details : data[3],
                                argsList: data[5],
                                argsDict: data[6]
                            });
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

                            if (!this._checkPPTOptions('broker', options)) {
                                // Since it is async publication, and no link to
                                // original publication - as it was already published
                                // we can not reply with error, only log it.
                                // Although the router should handle it

                                this._log(WAMP_ERROR_MSG.PPT_NOT_SUPPORTED.description);
                                break;
                            }

                            // wamp scheme means Payload End-to-End Encryption
                            // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
                            if (options.ppt_scheme === 'wamp') {

                                // TODO: implement End-to-End Encryption

                            }

                            if (options.ppt_serializer && options.ppt_serializer !== 'native') {
                                let pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

                                if (!pptSerializer) {
                                    this._log(WAMP_ERROR_MSG.PPT_SRLZ_INVALID.description);
                                    break;
                                }

                                try {
                                    decodedPayload = await pptSerializer.decode(pptPayload);
                                } catch (e) {
                                    this._log(WAMP_ERROR_MSG.PPT_SRLZ_ERR.description);
                                    break;
                                }
                            } else {
                                decodedPayload = pptPayload;
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

                            if (!this._checkPPTOptions('dealer', options)) {
                                this._log(this._cache.opStatus.description);
                                this._calls[data[1]].onError({
                                    error   : this._cache.opStatus.description,
                                    details : data[2],
                                    argsList: data[3],
                                    argsDict: data[4]
                                });
                                delete this._calls[data[1]];
                                break;
                            }

                            // wamp scheme means Payload End-to-End Encryption
                            // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
                            if (options.ppt_scheme === 'wamp') {

                                // TODO: implement End-to-End Encryption

                            }

                            if (options.ppt_serializer && options.ppt_serializer !== 'native') {
                                let pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

                                if (!pptSerializer) {
                                    this._log(WAMP_ERROR_MSG.PPT_SRLZ_INVALID.description);
                                    this._cache.opStatus = WAMP_ERROR_MSG.PPT_SRLZ_INVALID;
                                    this._calls[data[1]].onError({
                                        error   : WAMP_ERROR_MSG.PPT_SRLZ_INVALID.description,
                                        details : data[2],
                                        argsList: data[3],
                                        argsDict: data[4]
                                    });
                                    delete this._calls[data[1]];
                                    break;
                                }

                                try {
                                    decodedPayload = await pptSerializer.decode(pptPayload);
                                } catch (e) {
                                    this._log(WAMP_ERROR_MSG.PPT_SRLZ_ERR.description);
                                    this._cache.opStatus = WAMP_ERROR_MSG.PPT_SRLZ_ERR;
                                    this._calls[data[1]].onError({
                                        error   : WAMP_ERROR_MSG.PPT_SRLZ_INVALID.description,
                                        details : data[2],
                                        argsList: data[3],
                                        argsDict: data[4]
                                    });
                                    break;
                                }
                            } else {
                                decodedPayload = pptPayload;
                            }

                            argsList = decodedPayload.args;
                            argsDict = decodedPayload.kwargs;

                        } else {
                            argsList = data[3];
                            argsDict = data[4];
                        }

                        this._calls[data[1]].onSuccess({
                            details : options,
                            argsList: argsList,
                            argsDict: argsDict
                        });
                        if (!(options.progress && options.progress === true)) {
                            // We receive final result (progressive or not)
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
                                                if (this._cache.opStatus.code === WAMP_ERROR_MSG.PPT_NOT_SUPPORTED.code) {
                                                    // This case should not happen at all, but for safety
                                                    this._hardClose('wamp.error.protocol_violation', 'Trying to send YIELD in PPT Mode, while Dealer didn\'t announce it');
                                                } else {
                                                    invoke_error_handler({
                                                        details : results.options,
                                                        error   : this._cache.opStatus.description,
                                                        argsList: results.argsList,
                                                        argsDict: results.argsDict
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
                                    let res = this._preparePayload(results, options);

                                    if (res.err) {
                                        invoke_error_handler({
                                            details : results.options,
                                            error   : this._cache.opStatus.description,
                                            argsList: results.argsList,
                                            argsDict: results.argsDict
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

                            if (!this._checkPPTOptions('dealer', options)) {
                                // This case should not happen at all, but for safety
                                this._log(WAMP_ERROR_MSG.PPT_NOT_SUPPORTED.description);
                                this._hardClose('wamp.error.protocol_violation', 'Received INVOCATION in PPT Mode, while Dealer didn\'t announce it');
                                break;
                            }

                            // wamp scheme means Payload End-to-End Encryption
                            // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
                            if (options.ppt_scheme === 'wamp') {

                                // TODO: implement End-to-End Encryption

                            }

                            if (options.ppt_serializer && options.ppt_serializer !== 'native') {
                                let pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

                                if (!pptSerializer) {
                                    this._log(WAMP_ERROR_MSG.PPT_SRLZ_INVALID.description);
                                    invoke_error_handler({
                                        details : data[3],
                                        error   : WAMP_ERROR_MSG.PPT_SRLZ_INVALID.description,
                                        argsList: data[4],
                                        argsDict: data[5]
                                    });
                                    break;
                                }

                                try {
                                    decodedPayload = await pptSerializer.decode(pptPayload);
                                } catch (e) {
                                    this._log(WAMP_ERROR_MSG.PPT_SRLZ_ERR.description);
                                    invoke_error_handler({
                                        details : data[3],
                                        error   : WAMP_ERROR_MSG.PPT_SRLZ_ERR.description,
                                        argsList: data[4],
                                        argsDict: data[5]
                                    });
                                    break;
                                }
                            } else {
                                decodedPayload = pptPayload;
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
                        this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION;
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

        if (this._options.onError) {
            this._options.onError({ error });
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
            this.register(rpcName, { rpc: rpcs[rpcName].callbacks[0] });
        }
    }

    /* Wampy public API */

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
     * @returns {object} with 2 fields: code, description
     *      code: 0 - if operation was successful
     *      code > 0 - if error occurred
     *      description contains details about error
     *      reqId: last send request ID
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
     * @returns {Wampy}
     */
    connect (url) {
        if (url) {
            this._url = url;
        }

        if (this._options.realm) {

            const authp = (this._options.authid ? 1 : 0) +
                ((this._isArray(this._options.authmethods) && this._options.authmethods.length) ? 1 : 0) +
                (typeof this._options.onChallenge === 'function' ? 1 : 0);

            if (authp > 0 && authp < 3) {
                this._cache.opStatus = WAMP_ERROR_MSG.NO_CRA_CB_OR_ID;
                return this;
            }

            this._setWsProtocols();
            this._ws = getWebSocket(this._url, this._protocols, this._options.ws,
                this._options.additionalHeaders, this._options.wsRequestOptions);
            if (!this._ws) {
                this._cache.opStatus = WAMP_ERROR_MSG.NO_WS_OR_URL;
                return this;
            }
            this._initWsCallbacks();

        } else {
            this._cache.opStatus = WAMP_ERROR_MSG.NO_REALM;
        }

        return this;
    }

    /**
     * Disconnect from server
     * @returns {Wampy}
     */
    disconnect () {
        if (this._cache.sessionId) {
            // need to send goodbye message to server
            this._cache.isSayingGoodbye = true;
            this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.system_shutdown']);
        } else if (this._ws) {
            this._ws.close();
        }

        this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;

        return this;
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
        this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;

        return this;
    }

    /**
     * Subscribe to a topic on a broker
     *
     * @param {string} topicURI
     * @param {function|object} callbacks - if it is a function - it will be treated as published event callback
     *                          or it can be hash table of callbacks:
     *                          { onSuccess: will be called when subscribe would be confirmed
     *                            onError: will be called if subscribe would be aborted
     *                            onEvent: will be called on receiving published event }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { match: string matching policy ("prefix"|"wildcard") }
     *
     * @returns {Wampy}
     */
    subscribe (topicURI, callbacks, advancedOptions) {
        let reqId, patternBased = false;
        const options = {};

        if ((typeof (advancedOptions) !== 'undefined') &&
            this._isPlainObject(advancedOptions) &&
            Object.prototype.hasOwnProperty.call(advancedOptions, 'match')) {

            if (/prefix|wildcard/.test(advancedOptions.match)) {
                options.match = advancedOptions.match;
                patternBased = true;
            }
        }

        if (!this._preReqChecks({ topic: topicURI, patternBased: patternBased, allowWAMP: true },
            'broker',
            callbacks)) {
            return this;
        }

        if (typeof callbacks === 'function') {
            callbacks = { onEvent: callbacks };
        } else if (!this._isPlainObject(callbacks) || typeof (callbacks.onEvent) === 'undefined') {
            this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }

            return this;
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

            if (callbacks.onSuccess) {
                callbacks.onSuccess({
                    topic: topicURI,
                    subscriptionId: this._subscriptions[topicURI].id
                });
            }
        }

        this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return this;
    }

    /**
     * Unsubscribe from topic
     * @param {string} topicURI
     * @param {function|object} callbacks - if it is a function - it will be treated as
     *                          published event callback to remove or it can be hash table of callbacks:
     *                          { onSuccess: will be called when unsubscribe would be confirmed
     *                            onError: will be called if unsubscribe would be aborted
     *                            onEvent: published event callback to remove }
     * @returns {Wampy}
     */
    unsubscribe (topicURI, callbacks) {
        let reqId, i = -1;

        if (!this._preReqChecks(null, 'broker', callbacks)) {
            return this;
        }

        if (this._subscriptions[topicURI]) {

            reqId = this._getReqId();

            if (typeof (callbacks) === 'undefined') {
                this._subscriptions[topicURI].callbacks = [];
                callbacks = {};
            } else if (typeof callbacks === 'function') {
                i = this._subscriptions[topicURI].callbacks.indexOf(callbacks);
                callbacks = {};
            } else if (callbacks.onEvent && typeof callbacks.onEvent === 'function') {
                i = this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent);
            } else {
                this._subscriptions[topicURI].callbacks = [];
            }

            if (i >= 0) {
                this._subscriptions[topicURI].callbacks.splice(i, 1);
            }

            if (this._subscriptions[topicURI].callbacks.length) {
                // There are another callbacks for this topic
                this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
                return this;
            }

            this._requests[reqId] = {
                topic: topicURI,
                callbacks
            };

            // WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]
            this._send([WAMP_MSG_SPEC.UNSUBSCRIBE, reqId, this._subscriptions[topicURI].id]);

        } else {
            this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE;

            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }

            return this;
        }

        this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return this;
    }

    /**
     * Publish a event to topic
     * @param {string} topicURI
     * @param {string|number|Array|object} payload - can be either a value of any type or null.  Also it
     *                          is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {object} [callbacks] - optional hash table of callbacks:
     *                          { onSuccess: will be called when publishing would be confirmed
     *                            onError: will be called if publishing would be aborted }
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
     *                                      to receivers of a published event }
     * @returns {Wampy}
     */
    publish (topicURI, payload, callbacks, advancedOptions) {
        let reqId, msg, err = false, hasPayload = false;
        const options = {},
            _optionsConvertHelper = (option, sourceType) => {
                if (advancedOptions[option]) {
                    if (this._isArray(advancedOptions[option]) && advancedOptions[option].length) {
                        options[option] = advancedOptions[option];
                    } else if (typeof advancedOptions[option] === sourceType) {
                        options[option] = [advancedOptions[option]];
                    } else {
                        err = true;
                        this._cache.opStatus = WAMP_ERROR_MSG.INVALID_PARAM;
                    }
                }
            };

        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: false }, 'broker', callbacks)) {
            return this;
        }

        if (this._isPlainObject(callbacks)) {
            options.acknowledge = true;
        }

        if (typeof (advancedOptions) !== 'undefined') {

            if (this._isPlainObject(advancedOptions)) {
                _optionsConvertHelper('exclude', 'number');
                _optionsConvertHelper('exclude_authid', 'string');
                _optionsConvertHelper('exclude_authrole', 'string');
                _optionsConvertHelper('eligible', 'number');
                _optionsConvertHelper('eligible_authid', 'string');
                _optionsConvertHelper('eligible_authrole', 'string');

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
                    err = !this._checkPPTOptions('broker', advancedOptions);

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

            } else {
                err = true;
                this._cache.opStatus = WAMP_ERROR_MSG.INVALID_PARAM;
            }

            if (err) {

                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    callbacks.onError({ error: this._cache.opStatus.description });
                }

                return this;
            }
        }

        reqId = this._getReqId();

        switch (arguments.length) {
            case 1:
                break;
            case 2:
                hasPayload = true;
                break;
            default:
                this._requests[reqId] = {
                    topic: topicURI,
                    callbacks
                };
                hasPayload = true;
                break;
        }

        // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri]
        msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI];

        if (hasPayload) {
            // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
            let res = this._preparePayload(payload, options);

            if (res.err) {
                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    callbacks.onError({ error: this._cache.opStatus.description });
                }

                return this;
            }
            msg = msg.concat(res.payloadItems);
        }

        this._send(msg);
        this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return this;
    }

    /**
     * Remote Procedure Call
     * @param {string} topicURI
     * @param {string|number|Array|object} payload - can be either a value of any type or null.  Also it
     *                          is possible to pass array and object-like data simultaneously.
     *                          In this case pass a hash-table with next attributes:
     *                          {
     *                             argsList: array payload (may be omitted)
     *                             argsDict: object payload (may be omitted)
     *                          }
     * @param {function|object} callbacks - if it is a function - it will be treated as result callback function
     *                          or it can be hash table of callbacks:
     *                          { onSuccess: will be called with result on successful call
     *                            onError: will be called if invocation would be aborted }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { disclose_me: bool flag of disclosure of Caller identity (WAMP session ID)
     *                                  to endpoints of a routed call
     *                            receive_progress: bool flag for receiving progressive results. In this case
     *                                  onSuccess function will be called every time on receiving result
     *                            timeout: integer timeout (in ms) for the call to finish }
     * @returns {Wampy}
     */
    call (topicURI, payload, callbacks, advancedOptions) {
        let reqId, msg, err = false;
        const options = {};

        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: true }, 'dealer', callbacks)) {
            return this;
        }

        if (typeof callbacks === 'function') {
            callbacks = { onSuccess: callbacks };
        } else if (!this._isPlainObject(callbacks) || typeof (callbacks.onSuccess) === 'undefined') {
            this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }

            return this;
        }

        if (typeof (advancedOptions) !== 'undefined') {

            if (this._isPlainObject(advancedOptions)) {
                if (Object.hasOwnProperty.call(advancedOptions, 'disclose_me')) {
                    options.disclose_me = advancedOptions.disclose_me === true;
                }

                if (Object.hasOwnProperty.call(advancedOptions, 'receive_progress')) {
                    options.receive_progress = advancedOptions.receive_progress === true;
                }

                if (Object.hasOwnProperty.call(advancedOptions, 'timeout')) {
                    if (typeof advancedOptions.timeout === 'number') {
                        options.timeout = advancedOptions.timeout;
                    } else {
                        err = true;
                    }
                }

                // Check and handle Payload PassThru Mode
                // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
                let pptScheme = advancedOptions.ppt_scheme;

                if (pptScheme) {
                    err = !this._checkPPTOptions('dealer', advancedOptions);

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

            } else {
                err = true;
                this._cache.opStatus = WAMP_ERROR_MSG.INVALID_PARAM;
            }

            if (err) {

                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    callbacks.onError({ error: this._cache.opStatus.description });
                }

                return this;
            }
        }

        do {
            reqId = this._getReqId();
        } while (reqId in this._calls);

        this._calls[reqId] = callbacks;

        // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
        msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI];

        if (payload !== null && typeof (payload) !== 'undefined') {
            let res = this._preparePayload(payload, options);

            if (res.err) {
                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    callbacks.onError({ error: this._cache.opStatus.description });
                }

                return this;
            }
            msg = msg.concat(res.payloadItems);
        }

        this._send(msg);
        this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return this;
    }

    /**
     * RPC invocation cancelling
     *
     * @param {int} reqId RPC call request ID
     * @param {function|object} callbacks - if it is a function - it will be called if successfully
     *                          sent canceling message or it can be hash table of callbacks:
     *                          { onSuccess: will be called if successfully sent canceling message
     *                            onError: will be called if some error occurred }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          { mode: string|one of the possible modes:
     *                                  "skip" | "kill" | "killnowait". Skip is default.
     *                          }
     *
     * @returns {Wampy}
     */
    cancel (reqId, callbacks, advancedOptions) {
        let err = false;
        const options = {};

        if (!this._preReqChecks(null, 'dealer', callbacks)) {
            return this;
        }

        if (!reqId || !this._calls[reqId]) {
            this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID;

            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }

            return this;
        }

        if (typeof (advancedOptions) !== 'undefined') {

            if (this._isPlainObject(advancedOptions)) {

                if (Object.hasOwnProperty.call(advancedOptions, 'mode')) {
                    if (/skip|kill|killnowait/.test(advancedOptions.mode)) {
                        options.mode = advancedOptions.mode;
                    } else {
                        err = true;
                    }

                }
            } else {
                err = true;
            }

            if (err) {
                this._cache.opStatus = WAMP_ERROR_MSG.INVALID_PARAM;

                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    callbacks.onError({ error: this._cache.opStatus.description });
                }

                return this;
            }
        }

        // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]
        this._send([WAMP_MSG_SPEC.CANCEL, reqId, options]);
        this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;

        callbacks.onSuccess && callbacks.onSuccess();

        return this;
    }

    /**
     * RPC registration for invocation
     * @param {string} topicURI
     * @param {function|object} callbacks - if it is a function - it will be treated as rpc itself
     *                          or it can be hash table of callbacks:
     *                          { rpc: registered procedure
     *                            onSuccess: will be called on successful registration
     *                            onError: will be called if registration would be aborted }
     * @param {object} [advancedOptions] - optional parameter. Must include any or all of the options:
     *                          {
     *                              match: string matching policy ("prefix"|"wildcard")
     *                              invoke: string invocation policy ("single"|"roundrobin"|"random"|"first"|"last")
     *                          }
     * @returns {Wampy}
     */
    register (topicURI, callbacks, advancedOptions) {
        let reqId, patternBased = false, err = false;
        const options = {};

        if (typeof (advancedOptions) !== 'undefined') {

            if (this._isPlainObject(advancedOptions)) {

                if (Object.hasOwnProperty.call(advancedOptions, 'match')) {
                    if (/prefix|wildcard/.test(advancedOptions.match)) {
                        options.match = advancedOptions.match;
                        patternBased = true;
                    } else {
                        err = true;
                    }
                }

                if (Object.hasOwnProperty.call(advancedOptions, 'invoke')) {
                    if (/single|roundrobin|random|first|last/.test(advancedOptions.invoke)) {
                        options.invoke = advancedOptions.invoke;
                    } else {
                        err = true;
                    }
                }

            } else {
                err = true;
            }

            if (err) {
                this._cache.opStatus = WAMP_ERROR_MSG.INVALID_PARAM;

                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    callbacks.onError({ error: this._cache.opStatus.description });
                }

                return this;
            }
        }

        if (!this._preReqChecks({ topic: topicURI, patternBased: patternBased, allowWAMP: false },
            'dealer',
            callbacks)) {
            return this;
        }

        if (typeof callbacks === 'function') {
            callbacks = { rpc: callbacks };
        } else if (!this._isPlainObject(callbacks) || typeof (callbacks.rpc) === 'undefined') {
            this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }

            return this;
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
            this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
            this._cache.opStatus.reqId = reqId;
        } else {    // already have registration with such topicURI
            this._cache.opStatus = WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED;

            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }

        }

        return this;

    }

    /**
     * RPC unregistration for invocation
     * @param {string} topicURI
     * @param {function|object} callbacks - if it is a function, it will be called on successful unregistration
     *                          or it can be hash table of callbacks:
     *                          { onSuccess: will be called on successful unregistration
     *                            onError: will be called if unregistration would be aborted }
     * @returns {Wampy}
     */
    unregister (topicURI, callbacks) {
        let reqId;

        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: false }, 'dealer', callbacks)) {
            return this;
        }

        if (typeof callbacks === 'function') {
            callbacks = { onSuccess: callbacks };
        }

        if (this._rpcRegs[topicURI]) {   // there is such registration

            reqId = this._getReqId();

            this._requests[reqId] = {
                topic: topicURI,
                callbacks
            };

            // WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]
            this._send([WAMP_MSG_SPEC.UNREGISTER, reqId, this._rpcRegs[topicURI].id]);
            this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
            this._cache.opStatus.reqId = reqId;
        } else {    // there is no registration with such topicURI
            this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG;

            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }

        }

        return this;
    }
}

export default Wampy;
export { Wampy };
