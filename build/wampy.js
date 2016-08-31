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

'use strict';

// Module boilerplate to support browser globals and browserify and AMD.

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (root, m) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], m);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        module.exports = m();
    } else {
        // Browser globals
        root.Wampy = m();
    }
})(this, function () {

    var WAMP_MSG_SPEC = {
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
    },
        WAMP_ERROR_MSG = {
        SUCCESS: {
            code: 0,
            description: 'Success!'
        },
        URI_ERROR: {
            code: 1,
            description: 'Topic URI doesn\'t meet requirements!'
        },
        NO_BROKER: {
            code: 2,
            description: 'Server doesn\'t provide broker role!'
        },
        NO_CALLBACK_SPEC: {
            code: 3,
            description: 'No required callback function specified!'
        },
        INVALID_PARAM: {
            code: 4,
            description: 'Invalid parameter(s) specified!'
        },
        NON_EXIST_UNSUBSCRIBE: {
            code: 7,
            description: 'Trying to unsubscribe from non existent subscription!'
        },
        NO_DEALER: {
            code: 12,
            description: 'Server doesn\'t provide dealer role!'
        },
        RPC_ALREADY_REGISTERED: {
            code: 15,
            description: 'RPC already registered!'
        },
        NON_EXIST_RPC_UNREG: {
            code: 17,
            description: 'Received rpc unregistration for non existent rpc!'
        },
        NON_EXIST_RPC_INVOCATION: {
            code: 19,
            description: 'Received invocation for non existent rpc!'
        },
        NON_EXIST_RPC_REQ_ID: {
            code: 20,
            description: 'No RPC calls in action with specified request ID!'
        },
        NO_REALM: {
            code: 21,
            description: 'No realm specified!'
        },
        NO_WS_OR_URL: {
            code: 22,
            description: 'No websocket provided or URL specified is incorrect!'
        },
        NO_CRA_CB_OR_ID: {
            code: 23,
            description: 'No onChallenge callback or authid was provided for authentication!'
        },
        CRA_EXCEPTION: {
            code: 24,
            description: 'Exception raised during CRA challenge processing'
        }
    },
        isNode = (typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && Object.prototype.toString.call(process) === '[object process]';

    function getServerUrlBrowser(url) {
        var scheme = void 0,
            port = void 0;

        if (!url) {
            scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            port = window.location.port !== '' ? ':' + window.location.port : '';
            return scheme + window.location.hostname + port + '/ws';
        } else if (/^ws(s)?:\/\//.test(url)) {
            // ws scheme is specified
            return url;
        } else if (/:\d{1,5}/.test(url)) {
            // no scheme, but port is specified
            scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            return scheme + url;
        } else if (url[0] === '/') {
            // just path on current server
            scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            port = window.location.port !== '' ? ':' + window.location.port : '';
            return scheme + window.location.hostname + port + url;
        } else {
            // domain
            scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            return scheme + url;
        }
    }

    function getServerUrlNode(url) {
        if (/^ws(s)?:\/\//.test(url)) {
            // ws scheme is specified
            return url;
        } else {
            return null;
        }
    }

    function getWebSocket(url, protocols, ws) {
        var parsedUrl = isNode ? getServerUrlNode(url) : getServerUrlBrowser(url);

        if (!parsedUrl) {
            return null;
        }

        if (ws) {
            // User provided webSocket class
            return new ws(parsedUrl, protocols);
        } else if (isNode) {
            // we're in node, but no webSocket provided
            return null;
        } else {
            // we're in browser
            if ('WebSocket' in window) {
                // Chrome, MSIE, newer Firefox
                return new window.WebSocket(parsedUrl, protocols);
            } else if ('MozWebSocket' in window) {
                // older versions of Firefox
                return new window.MozWebSocket(parsedUrl, protocols);
            }
        }

        return null;
    }

    /**
     * WAMP Client Class
     */

    var Wampy = function () {

        /**
         * Wampy constructor
         * @param {string} url
         * @param {Object} options
         */

        function Wampy(url, options) {
            _classCallCheck(this, Wampy);

            /**
             * Wampy version
             * @type {string}
             * @private
             */
            this.version = 'v4.0.0';

            /**
             * WS Url
             * @type {string}
             * @private
             */
            this._url = typeof url === 'string' ? url : null;

            /**
             * WS protocols
             * @type {Array}
             * @private
             */
            this._protocols = ['wamp.2.json'];

            /**
             * Supported authentication methods
             * @type {array}
             */
            this._authmethods = ['wampcra'];

            /**
             * WAMP features, supported by Wampy
             * @type {object}
             * @private
             */
            this._wamp_features = {
                agent: 'Wampy.js ' + this.version,
                roles: {
                    publisher: {
                        features: {
                            subscriber_blackwhite_listing: true,
                            publisher_exclusion: true,
                            publisher_identification: true
                        }
                    },
                    subscriber: {},
                    caller: {
                        features: {
                            caller_identification: true,
                            progressive_call_results: true,
                            call_canceling: true,
                            call_timeout: true
                        }
                    },
                    callee: {
                        features: {
                            caller_identification: true
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
                 * @type {string}
                 */
                sessionId: null,

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
             * @type {Array}
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
             * @type {Array}
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
                 * Message serializer
                 * @type {string}
                 */
                transportEncoding: 'json',

                /**
                 * WAMP Realm to join
                 * @type {string}
                 */
                realm: null,

                /**
                 * Custom attributes to send to router on hello
                 * @type {object}
                 */
                helloCustomDetails: null,

                /**
                 * onChallenge callback
                 * @type {function}
                 */
                onChallenge: null,

                /**
                 * Authentication id to use in challenge
                 * @type {string}
                 */
                authid: null,

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
                 * User provided msgpack class
                 * @type {function}
                 */
                msgpackCoder: null
            };

            switch (arguments.length) {
                case 1:
                    if (typeof arguments[0] !== 'string') {
                        this._options = this._merge(this._options, arguments[0]);
                    }
                    break;
                case 2:
                    this._options = this._merge(this._options, options);
                    break;
            }

            this.connect();
        }

        /* Internal utils methods */
        /**
         * Internal logger
         * @private
         */


        _createClass(Wampy, [{
            key: '_log',
            value: function _log() {
                if (this._options.debug) {
                    console.log(arguments);
                }
            }

            /**
             * Get the new unique request id
             * @returns {number}
             * @private
             */

        }, {
            key: '_getReqId',
            value: function _getReqId() {
                var reqId = void 0;

                do {
                    /* Lua (and cjson) outputs big numbers in scientific notation :(
                     * Need to find a way of fixing that
                     * For now, i think it's not a big problem to reduce range.
                     */
                    //          reqId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);    // 9007199254740992
                    reqId = Math.floor(Math.random() * 100000000000000);
                } while (reqId in this._requests);

                return reqId;
            }

            /**
             * Merge argument objects into one
             * @returns {Object}
             * @private
             */

        }, {
            key: '_merge',
            value: function _merge() {
                var obj = {},
                    i = void 0,
                    l = arguments.length,
                    attr = void 0;

                for (i = 0; i < l; i++) {
                    for (attr in arguments[i]) {
                        obj[attr] = arguments[i][attr];
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

        }, {
            key: '_isArray',
            value: function _isArray(obj) {
                return !!obj && obj.constructor === Array;
            }

            /**
             * Check if value is object literal
             * @param obj
             * @returns {boolean}
             * @private
             */

        }, {
            key: '_isPlainObject',
            value: function _isPlainObject(obj) {
                return !!obj && obj.constructor === Object;
            }

            /**
             * Fix websocket protocols based on options
             * @private
             */

        }, {
            key: '_setWsProtocols',
            value: function _setWsProtocols() {
                if (this._options.msgpackCoder) {
                    if (this._options.transportEncoding === 'msgpack') {
                        this._protocols = ['wamp.2.msgpack', 'wamp.2.json'];
                    } else {
                        this._protocols = ['wamp.2.json', 'wamp.2.msgpack'];
                    }
                }
            }

            /**
             * Validate uri
             * @param {string} uri
             * @returns {boolean}
             * @private
             */

        }, {
            key: '_validateURI',
            value: function _validateURI(uri) {
                var re = /^([0-9a-zA-Z_]{2,}\.)*([0-9a-zA-Z_]{2,})$/;
                if (!re.test(uri) || uri.indexOf('wamp') === 0) {
                    return false;
                } else {
                    return true;
                }
            }

            /**
             * Encode WAMP message
             * @param {Array} msg
             * @returns {*}
             * @private
             */

        }, {
            key: '_encode',
            value: function _encode(msg) {

                if (this._options.transportEncoding === 'msgpack' && this._options.msgpackCoder) {
                    try {
                        return this._options.msgpackCoder.encode(msg);
                    } catch (e) {
                        throw new Error('[wampy] msgpack encode exception!');
                    }
                } else {
                    return JSON.stringify(msg);
                }
            }

            /**
             * Decode WAMP message
             * @param  msg
             * @returns {array}
             * @private
             */

        }, {
            key: '_decode',
            value: function _decode(msg) {
                if (this._options.transportEncoding === 'msgpack' && this._options.msgpackCoder) {
                    try {
                        return this._options.msgpackCoder.decode(new Uint8Array(msg));
                    } catch (e) {
                        throw new Error('[wampy] msgpack decode exception!');
                    }
                } else {
                    return JSON.parse(msg);
                }
            }

            /**
             * Send encoded message to server
             * @param {Array} msg
             * @private
             */

        }, {
            key: '_send',
            value: function _send(msg) {
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

        }, {
            key: '_resetState',
            value: function _resetState() {
                this._wsQueue = [];
                this._subscriptions = {};
                this._subsTopics = new Set();
                this._requests = {};
                this._calls = {};
                this._rpcRegs = {};
                this._rpcNames = new Set();

                // Just keep attrs that are have to be present
                this._cache = {
                    reconnectingAttempts: 0
                };
            }

            /**
             * Initialize internal websocket callbacks
             * @private
             */

        }, {
            key: '_initWsCallbacks',
            value: function _initWsCallbacks() {
                var _this = this;

                if (this._ws) {
                    this._ws.onopen = function () {
                        _this._wsOnOpen();
                    };
                    this._ws.onclose = function (event) {
                        _this._wsOnClose(event);
                    };
                    this._ws.onmessage = function (event) {
                        _this._wsOnMessage(event);
                    };
                    this._ws.onerror = function (error) {
                        _this._wsOnError(error);
                    };
                }
            }
        }, {
            key: '_wsOnOpen',
            value: function _wsOnOpen() {
                var options = this._merge(this._options.helloCustomDetails, this._wamp_features);

                if (this._options.authid) {
                    options.authmethods = this._authmethods;
                    options.authid = this._options.authid;
                }

                this._log('[wampy] websocket connected');

                if (this._ws.protocol) {
                    this._options.transportEncoding = this._ws.protocol.split('.')[2];
                }

                if (this._options.transportEncoding === 'msgpack') {
                    this._ws.binaryType = 'arraybuffer';
                }

                // WAMP SPEC: [HELLO, Realm|uri, Details|dict]
                // Sending directly 'cause it's a hello msg and no sessionId check is needed
                this._ws.send(this._encode([WAMP_MSG_SPEC.HELLO, this._options.realm, options]));
            }
        }, {
            key: '_wsOnClose',
            value: function _wsOnClose() {
                var _this2 = this;

                var root = isNode ? global : window;
                this._log('[wampy] websocket disconnected');

                // Automatic reconnection
                if ((this._cache.sessionId || this._cache.reconnectingAttempts) && this._options.autoReconnect && this._cache.reconnectingAttempts < this._options.maxRetries && !this._cache.isSayingGoodbye) {
                    this._cache.sessionId = null;
                    this._cache.timer = root.setTimeout(function () {
                        _this2._wsReconnect();
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
        }, {
            key: '_wsOnMessage',
            value: function _wsOnMessage(event) {
                var _this3 = this;

                var data = void 0,
                    id = void 0,
                    i = void 0,
                    msg = void 0,
                    p = void 0;

                this._log('[wampy] websocket message received', event.data);

                data = this._decode(event.data);

                switch (data[0]) {
                    case WAMP_MSG_SPEC.WELCOME:
                        // WAMP SPEC: [WELCOME, Session|id, Details|dict]

                        this._cache.sessionId = data[1];
                        this._cache.server_wamp_features = data[2];

                        if (this._cache.reconnectingAttempts) {
                            // There was reconnection

                            this._cache.reconnectingAttempts = 0;

                            if (this._options.onReconnectSuccess) {
                                this._options.onReconnectSuccess();
                            }

                            // Let's renew all previous state
                            this._renewSubscriptions();
                            this._renewRegistrations();
                        } else {
                            // Firing onConnect event on real connection to WAMP server
                            if (this._options.onConnect) {
                                this._options.onConnect();
                            }
                        }

                        // Send local queue if there is something out there
                        this._send();

                        break;
                    case WAMP_MSG_SPEC.ABORT:
                        // WAMP SPEC: [ABORT, Details|dict, Reason|uri]
                        if (this._options.onError) {
                            this._options.onError(data[1].message ? data[1].message : data[2]);
                        }
                        this._ws.close();
                        break;
                    case WAMP_MSG_SPEC.CHALLENGE:
                        // WAMP SPEC: [CHALLENGE, AuthMethod|string, Extra|dict]

                        if (this._options.authid && typeof this._options.onChallenge === 'function') {

                            p = new Promise(function (resolve, reject) {
                                resolve(_this3._options.onChallenge(data[1], data[2]));
                            });

                            p.then(function (key) {

                                // Sending directly 'cause it's a challenge msg and no sessionId check is needed
                                _this3._ws.send(_this3._encode([WAMP_MSG_SPEC.AUTHENTICATE, key, {}]));
                            }).catch(function (e) {
                                _this3._ws.send(_this3._encode([WAMP_MSG_SPEC.ABORT, { message: 'Exception in onChallenge handler raised!' }, 'wamp.error.cannot_authenticate']));
                                if (_this3._options.onError) {
                                    _this3._options.onError(WAMP_ERROR_MSG.CRA_EXCEPTION.description);
                                }
                                _this3._ws.close();
                                _this3._cache.opStatus = WAMP_ERROR_MSG.CRA_EXCEPTION;
                            });
                        } else {

                            this._ws.send(this._encode([WAMP_MSG_SPEC.ABORT, { message: WAMP_ERROR_MSG.NO_CRA_CB_OR_ID.description }, 'wamp.error.cannot_authenticate']));
                            if (this._options.onError) {
                                this._options.onError(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID.description);
                            }
                            this._ws.close();
                            this._cache.opStatus = WAMP_ERROR_MSG.NO_CRA_CB_OR_ID;
                        }
                        break;
                    case WAMP_MSG_SPEC.GOODBYE:
                        // WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
                        if (!this._cache.isSayingGoodbye) {
                            // get goodbye, initiated by server
                            this._cache.isSayingGoodbye = true;
                            this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.error.goodbye_and_out']);
                        }
                        this._cache.sessionId = null;
                        this._ws.close();
                        break;
                    case WAMP_MSG_SPEC.ERROR:
                        // WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict,
                        //             Error|uri, (Arguments|list, ArgumentsKw|dict)]
                        switch (data[1]) {
                            case WAMP_MSG_SPEC.SUBSCRIBE:
                            case WAMP_MSG_SPEC.UNSUBSCRIBE:
                                if (this._requests[data[2]]) {

                                    if (this._requests[data[2]].callbacks.onError) {
                                        this._requests[data[2]].callbacks.onError(data[4], data[3]);
                                    }

                                    delete this._requests[data[2]];
                                }
                                break;
                            case WAMP_MSG_SPEC.PUBLISH:
                                if (this._requests[data[2]]) {

                                    if (this._requests[data[2]].callbacks.onError) {
                                        this._requests[data[2]].callbacks.onError(data[4], data[3]);
                                    }

                                    delete this._requests[data[2]];
                                }
                                break;
                            case WAMP_MSG_SPEC.REGISTER:
                            case WAMP_MSG_SPEC.UNREGISTER:
                                // WAMP SPEC: [ERROR, REGISTER, REGISTER.Request|id, Details|dict, Error|uri]
                                if (this._requests[data[2]]) {

                                    if (this._requests[data[2]].callbacks.onError) {
                                        this._requests[data[2]].callbacks.onError(data[4], data[3]);
                                    }

                                    delete this._requests[data[2]];
                                }
                                break;
                            case WAMP_MSG_SPEC.INVOCATION:
                                break;
                            case WAMP_MSG_SPEC.CALL:
                                if (this._calls[data[2]]) {

                                    if (this._calls[data[2]].onError) {
                                        // WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict,
                                        //             Error|uri, Arguments|list, ArgumentsKw|dict]
                                        this._calls[data[2]].onError(data[4], data[3], data[5], data[6]);
                                    }

                                    delete this._calls[data[2]];
                                }
                                break;
                        }
                        break;
                    case WAMP_MSG_SPEC.SUBSCRIBED:
                        // WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
                        if (this._requests[data[1]]) {
                            this._subscriptions[this._requests[data[1]].topic] = this._subscriptions[data[2]] = {
                                id: data[2],
                                callbacks: [this._requests[data[1]].callbacks.onEvent]
                            };

                            this._subsTopics.add(this._requests[data[1]].topic);

                            if (this._requests[data[1]].callbacks.onSuccess) {
                                this._requests[data[1]].callbacks.onSuccess();
                            }

                            delete this._requests[data[1]];
                        }
                        break;
                    case WAMP_MSG_SPEC.UNSUBSCRIBED:
                        // WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
                        if (this._requests[data[1]]) {
                            id = this._subscriptions[this._requests[data[1]].topic].id;
                            delete this._subscriptions[this._requests[data[1]].topic];
                            delete this._subscriptions[id];

                            if (this._subsTopics.has(this._requests[data[1]].topic)) {
                                this._subsTopics.delete(this._requests[data[1]].topic);
                            }

                            if (this._requests[data[1]].callbacks.onSuccess) {
                                this._requests[data[1]].callbacks.onSuccess();
                            }

                            delete this._requests[data[1]];
                        }
                        break;
                    case WAMP_MSG_SPEC.PUBLISHED:
                        // WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
                        if (this._requests[data[1]]) {
                            if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                                this._requests[data[1]].callbacks.onSuccess();
                            }

                            delete this._requests[data[1]];
                        }
                        break;
                    case WAMP_MSG_SPEC.EVENT:
                        if (this._subscriptions[data[1]]) {

                            // WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id,
                            //             Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]

                            i = this._subscriptions[data[1]].callbacks.length;
                            while (i--) {
                                this._subscriptions[data[1]].callbacks[i](data[4], data[5]);
                            }
                        }
                        break;
                    case WAMP_MSG_SPEC.RESULT:
                        if (this._calls[data[1]]) {

                            // WAMP SPEC: [RESULT, CALL.Request|id, Details|dict,
                            //             YIELD.Arguments|list, YIELD.ArgumentsKw|dict]

                            this._calls[data[1]].onSuccess(data[3], data[4]);
                            if (!(data[2].progress && data[2].progress === true)) {
                                // We receive final result (progressive or not)
                                delete this._calls[data[1]];
                            }
                        }
                        break;
                    case WAMP_MSG_SPEC.REGISTER:
                        // WAMP SPEC:
                        break;
                    case WAMP_MSG_SPEC.REGISTERED:
                        // WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
                        if (this._requests[data[1]]) {
                            this._rpcRegs[this._requests[data[1]].topic] = this._rpcRegs[data[2]] = {
                                id: data[2],
                                callbacks: [this._requests[data[1]].callbacks.rpc]
                            };

                            this._rpcNames.add(this._requests[data[1]].topic);

                            if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                                this._requests[data[1]].callbacks.onSuccess();
                            }

                            delete this._requests[data[1]];
                        }
                        break;
                    case WAMP_MSG_SPEC.UNREGISTER:
                        // WAMP SPEC:
                        break;
                    case WAMP_MSG_SPEC.UNREGISTERED:
                        // WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
                        if (this._requests[data[1]]) {
                            id = this._rpcRegs[this._requests[data[1]].topic].id;
                            delete this._rpcRegs[this._requests[data[1]].topic];
                            delete this._rpcRegs[id];

                            if (this._rpcNames.has(this._requests[data[1]].topic)) {
                                this._rpcNames.delete(this._requests[data[1]].topic);
                            }

                            if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                                this._requests[data[1]].callbacks.onSuccess();
                            }

                            delete this._requests[data[1]];
                        }
                        break;
                    case WAMP_MSG_SPEC.INVOCATION:
                        if (this._rpcRegs[data[2]]) {

                            // WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id,
                            //             Details|dict, CALL.Arguments|list, CALL.ArgumentsKw|dict]

                            p = new Promise(function (resolve, reject) {
                                resolve(_this3._rpcRegs[data[2]].callbacks[0](data[4], data[5], data[3]));
                            });

                            p.then(function (results) {
                                // WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, (Arguments|list, ArgumentsKw|dict)]
                                if (results) {
                                    if (_this3._isArray(results[1])) {
                                        msg = [WAMP_MSG_SPEC.YIELD, data[1], results[0], results[1]];
                                    } else if (_this3._isPlainObject(results[1])) {
                                        msg = [WAMP_MSG_SPEC.YIELD, data[1], results[0], [], results[1]];
                                    } else if (typeof results[1] === 'undefined') {
                                        msg = [WAMP_MSG_SPEC.YIELD, data[1], results[0]];
                                    } else {
                                        // single value
                                        msg = [WAMP_MSG_SPEC.YIELD, data[1], results[0], [results[1]]];
                                    }
                                } else {
                                    msg = [WAMP_MSG_SPEC.YIELD, data[1], {}];
                                }
                                _this3._send(msg);
                            }).catch(function (e) {
                                _this3._send([WAMP_MSG_SPEC.ERROR, WAMP_MSG_SPEC.INVOCATION, data[1], {}, 'wamp.error.invocation_exception']);
                            });
                        } else {
                            // WAMP SPEC: [ERROR, INVOCATION, INVOCATION.Request|id, Details|dict, Error|uri]
                            this._send([WAMP_MSG_SPEC.ERROR, WAMP_MSG_SPEC.INVOCATION, data[1], {}, 'wamp.error.no_such_procedure']);
                            this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION;
                        }

                        break;
                    case WAMP_MSG_SPEC.INTERRUPT:
                        // WAMP SPEC:
                        break;
                    case WAMP_MSG_SPEC.YIELD:
                        // WAMP SPEC:
                        break;
                }
            }
        }, {
            key: '_wsOnError',
            value: function _wsOnError(error) {
                this._log('[wampy] websocket error');

                if (this._options.onError) {
                    this._options.onError(error);
                }
            }
        }, {
            key: '_wsReconnect',
            value: function _wsReconnect() {
                this._log('[wampy] websocket reconnecting...');

                if (this._options.onReconnect) {
                    this._options.onReconnect();
                }

                this._cache.reconnectingAttempts++;
                this._ws = getWebSocket(this._url, this._protocols, this._options.ws);
                this._initWsCallbacks();
            }
        }, {
            key: '_renewSubscriptions',
            value: function _renewSubscriptions() {
                var subs = this._subscriptions,
                    st = this._subsTopics,
                    i = void 0;

                this._subscriptions = {};
                this._subsTopics = new Set();

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = st[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var topic = _step.value;

                        i = subs[topic].callbacks.length;
                        while (i--) {
                            this.subscribe(topic, subs[topic].callbacks[i]);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }, {
            key: '_renewRegistrations',
            value: function _renewRegistrations() {
                var rpcs = this._rpcRegs,
                    rn = this._rpcNames;

                this._rpcRegs = {};
                this._rpcNames = new Set();

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = rn[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var rpcName = _step2.value;

                        this.register(rpcName, { rpc: rpcs[rpcName].callbacks[0] });
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }

            /* Wampy public API */

            /**
             * Get or set Wampy options
             *
             * To get options - call without parameters
             * To set options - pass hash-table with options values
             *
             * @param {object} opts
             * @returns {*}
             */

        }, {
            key: 'options',
            value: function options(opts) {
                if (typeof opts === 'undefined') {
                    return this._options;
                } else if (this._isPlainObject(opts)) {
                    this._options = this._merge(this._options, opts);
                    return this;
                }
            }

            /**
             * Get the status of last operation
             *
             * @returns {code, description}
             *      code: 0 - if operation was successful
             *      code > 0 - if error occurred
             *      description contains details about error
             *      reqId: last send request ID
             */

        }, {
            key: 'getOpStatus',
            value: function getOpStatus() {
                return this._cache.opStatus;
            }

            /**
             * Get the WAMP Session ID
             *
             * @returns {string} Session ID
             */

        }, {
            key: 'getSessionId',
            value: function getSessionId() {
                return this._cache.sessionId;
            }

            /**
             * Connect to server
             * @param {string} url New url (optional)
             * @returns {Wampy}
             */

        }, {
            key: 'connect',
            value: function connect(url) {
                if (url) {
                    this._url = url;
                }

                if (this._options.realm) {

                    if (!this._options.authid && typeof this._options.onChallenge === 'function' || this._options.authid && typeof this._options.onChallenge !== 'function') {
                        this._cache.opStatus = WAMP_ERROR_MSG.NO_CRA_CB_OR_ID;
                        return this;
                    }

                    this._setWsProtocols();
                    this._ws = getWebSocket(this._url, this._protocols, this._options.ws);
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

        }, {
            key: 'disconnect',
            value: function disconnect() {
                if (this._cache.sessionId) {
                    // need to send goodbye message to server
                    this._cache.isSayingGoodbye = true;
                    this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.error.system_shutdown']);
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

        }, {
            key: 'abort',
            value: function abort() {

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
             *
             * @returns {Wampy}
             */

        }, {
            key: 'subscribe',
            value: function subscribe(topicURI, callbacks) {
                var reqId = void 0;

                if (this._cache.sessionId && !this._cache.server_wamp_features.roles.broker) {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_BROKER;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (!this._validateURI(topicURI)) {
                    this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (typeof callbacks === 'function') {
                    callbacks = { onEvent: callbacks };
                } else if (!this._isPlainObject(callbacks) || typeof callbacks.onEvent === 'undefined') {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (!this._subscriptions[topicURI] || !this._subscriptions[topicURI].callbacks.length) {
                    // no such subscription or processing unsubscribing

                    reqId = this._getReqId();

                    this._requests[reqId] = {
                        topic: topicURI,
                        callbacks: callbacks
                    };

                    // WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
                    this._send([WAMP_MSG_SPEC.SUBSCRIBE, reqId, {}, topicURI]);
                } else {
                    // already have subscription to this topic
                    // There is no such callback yet
                    if (this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent) < 0) {
                        this._subscriptions[topicURI].callbacks.push(callbacks.onEvent);
                    }

                    if (callbacks.onSuccess) {
                        callbacks.onSuccess();
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

        }, {
            key: 'unsubscribe',
            value: function unsubscribe(topicURI, callbacks) {
                var reqId = void 0,
                    i = -1;

                if (this._cache.sessionId && !this._cache.server_wamp_features.roles.broker) {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_BROKER;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (this._subscriptions[topicURI]) {

                    reqId = this._getReqId();

                    if (typeof callbacks === 'undefined') {
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
                        callbacks: callbacks
                    };

                    // WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]
                    this._send([WAMP_MSG_SPEC.UNSUBSCRIBE, reqId, this._subscriptions[topicURI].id]);
                } else {
                    this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
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
             * @param {string|number|Array|object} payload - optional parameter.
             * @param {object} callbacks - optional hash table of callbacks:
             *                          { onSuccess: will be called when publishing would be confirmed
             *                            onError: will be called if publishing would be aborted }
             * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
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

        }, {
            key: 'publish',
            value: function publish(topicURI, payload, callbacks, advancedOptions) {
                var reqId = void 0,
                    msg = void 0,
                    options = {},
                    err = false;

                if (this._cache.sessionId && !this._cache.server_wamp_features.roles.broker) {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_BROKER;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (!this._validateURI(topicURI)) {
                    this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (this._isPlainObject(callbacks)) {
                    options.acknowledge = true;
                }

                if (typeof advancedOptions !== 'undefined') {

                    if (this._isPlainObject(advancedOptions)) {
                        if (advancedOptions.exclude) {
                            if (this._isArray(advancedOptions.exclude) && advancedOptions.exclude.length) {
                                options.exclude = advancedOptions.exclude;
                            } else if (typeof advancedOptions.exclude === 'number') {
                                options.exclude = [advancedOptions.exclude];
                            } else {
                                err = true;
                            }
                        }

                        if (advancedOptions.exclude_authid) {
                            if (this._isArray(advancedOptions.exclude_authid) && advancedOptions.exclude_authid.length) {
                                options.exclude_authid = advancedOptions.exclude_authid;
                            } else if (typeof advancedOptions.exclude_authid === 'string') {
                                options.exclude_authid = [advancedOptions.exclude_authid];
                            } else {
                                err = true;
                            }
                        }

                        if (advancedOptions.exclude_authrole) {
                            if (this._isArray(advancedOptions.exclude_authrole) && advancedOptions.exclude_authrole.length) {
                                options.exclude_authrole = advancedOptions.exclude_authrole;
                            } else if (typeof advancedOptions.exclude_authrole === 'string') {
                                options.exclude_authrole = [advancedOptions.exclude_authrole];
                            } else {
                                err = true;
                            }
                        }

                        if (advancedOptions.eligible) {
                            if (this._isArray(advancedOptions.eligible) && advancedOptions.eligible.length) {
                                options.eligible = advancedOptions.eligible;
                            } else if (typeof advancedOptions.eligible === 'number') {
                                options.eligible = [advancedOptions.eligible];
                            } else {
                                err = true;
                            }
                        }

                        if (advancedOptions.eligible_authid) {
                            if (this._isArray(advancedOptions.eligible_authid) && advancedOptions.eligible_authid.length) {
                                options.eligible_authid = advancedOptions.eligible_authid;
                            } else if (typeof advancedOptions.eligible_authid === 'string') {
                                options.eligible_authid = [advancedOptions.eligible_authid];
                            } else {
                                err = true;
                            }
                        }

                        if (advancedOptions.eligible_authrole) {
                            if (this._isArray(advancedOptions.eligible_authrole) && advancedOptions.eligible_authrole.length) {
                                options.eligible_authrole = advancedOptions.eligible_authrole;
                            } else if (typeof advancedOptions.eligible_authrole === 'string') {
                                options.eligible_authrole = [advancedOptions.eligible_authrole];
                            } else {
                                err = true;
                            }
                        }

                        if (advancedOptions.hasOwnProperty('exclude_me')) {
                            options.exclude_me = advancedOptions.exclude_me !== false;
                        }

                        if (advancedOptions.hasOwnProperty('disclose_me')) {
                            options.disclose_me = advancedOptions.disclose_me === true;
                        }
                    } else {
                        err = true;
                    }

                    if (err) {
                        this._cache.opStatus = WAMP_ERROR_MSG.INVALID_PARAM;

                        if (this._isPlainObject(callbacks) && callbacks.onError) {
                            callbacks.onError(this._cache.opStatus.description);
                        }

                        return this;
                    }
                }

                reqId = this._getReqId();

                switch (arguments.length) {
                    case 1:
                        // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri]
                        msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI];
                        break;
                    case 2:
                        // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
                        if (this._isArray(payload)) {
                            msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, payload];
                        } else if (this._isPlainObject(payload)) {
                            msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, [], payload];
                        } else {
                            // assume it's a single value
                            msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, [payload]];
                        }
                        break;
                    default:
                        this._requests[reqId] = {
                            topic: topicURI,
                            callbacks: callbacks
                        };

                        // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
                        if (this._isArray(payload)) {
                            msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, payload];
                        } else if (this._isPlainObject(payload)) {
                            msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, [], payload];
                        } else {
                            // assume it's a single value
                            msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, [payload]];
                        }
                        break;
                }

                this._send(msg);
                this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
                this._cache.opStatus.reqId = reqId;
                return this;
            }

            /**
             * Remote Procedure Call
             * @param {string} topicURI
             * @param {string|number|Array|object} payload - can be either a value of any type or null
             * @param {function|object} callbacks - if it is a function - it will be treated as result callback function
             *                          or it can be hash table of callbacks:
             *                          { onSuccess: will be called with result on successful call
             *                            onError: will be called if invocation would be aborted }
             * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
             *                          { disclose_me: bool flag of disclosure of Caller identity (WAMP session ID)
             *                                  to endpoints of a routed call
             *                            receive_progress: bool flag for receiving progressive results. In this case
             *                                  onSuccess function will be called every time on receiving result
             *                            timeout: integer timeout (in ms) for the call to finish }
             * @returns {Wampy}
             */

        }, {
            key: 'call',
            value: function call(topicURI, payload, callbacks, advancedOptions) {
                var reqId = void 0,
                    msg = void 0,
                    options = {},
                    err = false;

                if (this._cache.sessionId && !this._cache.server_wamp_features.roles.dealer) {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (!this._validateURI(topicURI)) {
                    this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (typeof callbacks === 'function') {
                    callbacks = { onSuccess: callbacks };
                } else if (!this._isPlainObject(callbacks) || typeof callbacks.onSuccess === 'undefined') {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (typeof advancedOptions !== 'undefined') {

                    if (this._isPlainObject(advancedOptions)) {
                        if (advancedOptions.hasOwnProperty('disclose_me')) {
                            options.disclose_me = advancedOptions.disclose_me === true;
                        }

                        if (advancedOptions.hasOwnProperty('receive_progress')) {
                            options.receive_progress = advancedOptions.receive_progress === true;
                        }

                        if (advancedOptions.hasOwnProperty('timeout')) {
                            if (typeof advancedOptions.timeout === 'number') {
                                options.timeout = advancedOptions.timeout;
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
                            callbacks.onError(this._cache.opStatus.description);
                        }

                        return this;
                    }
                }

                do {
                    reqId = this._getReqId();
                } while (reqId in this._calls);

                this._calls[reqId] = callbacks;

                // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
                if (payload === null) {
                    msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI];
                } else {
                    if (this._isArray(payload)) {
                        msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI, payload];
                    } else if (this._isPlainObject(payload)) {
                        msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI, [], payload];
                    } else {
                        // assume it's a single value
                        msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI, [payload]];
                    }
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
             * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
             *                          { mode: string|one of the possible modes:
             *                                  "skip" | "kill" | "killnowait". Skip is default.
              *                          }
             *
             * @returns {Wampy}
             */

        }, {
            key: 'cancel',
            value: function cancel(reqId, callbacks, advancedOptions) {
                var options = { mode: 'skip' };

                if (this._cache.sessionId && !this._cache.server_wamp_features.roles.dealer) {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (!reqId || !this._calls[reqId]) {
                    this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (typeof advancedOptions !== 'undefined') {
                    if (this._isPlainObject(advancedOptions)) {
                        if (advancedOptions.hasOwnProperty('mode')) {
                            options.mode = /skip|kill|killnowait/.test(advancedOptions.mode) ? advancedOptions.mode : 'skip';
                        }
                    }
                }

                // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]
                this._send([WAMP_MSG_SPEC.CANCEL, reqId, options]);

                if (callbacks.onSuccess) {
                    callbacks.onSuccess();
                }

                this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
                this._cache.opStatus.reqId = reqId;
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
             * @returns {Wampy}
             */

        }, {
            key: 'register',
            value: function register(topicURI, callbacks) {
                var reqId = void 0;

                if (this._cache.sessionId && !this._cache.server_wamp_features.roles.dealer) {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (!this._validateURI(topicURI)) {
                    this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (typeof callbacks === 'function') {
                    callbacks = { rpc: callbacks };
                } else if (!this._isPlainObject(callbacks) || typeof callbacks.rpc === 'undefined') {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (!this._rpcRegs[topicURI] || !this._rpcRegs[topicURI].callbacks.length) {
                    // no such registration or processing unregistering

                    reqId = this._getReqId();

                    this._requests[reqId] = {
                        topic: topicURI,
                        callbacks: callbacks
                    };

                    // WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]
                    this._send([WAMP_MSG_SPEC.REGISTER, reqId, {}, topicURI]);
                    this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
                    this._cache.opStatus.reqId = reqId;
                } else {
                    // already have registration with such topicURI
                    this._cache.opStatus = WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
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

        }, {
            key: 'unregister',
            value: function unregister(topicURI, callbacks) {
                var reqId = void 0;

                if (this._cache.sessionId && !this._cache.server_wamp_features.roles.dealer) {
                    this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (!this._validateURI(topicURI)) {
                    this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }

                    return this;
                }

                if (typeof callbacks === 'function') {
                    callbacks = { onSuccess: callbacks };
                }

                if (this._rpcRegs[topicURI]) {
                    // there is such registration

                    reqId = this._getReqId();

                    this._requests[reqId] = {
                        topic: topicURI,
                        callbacks: callbacks
                    };

                    // WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]
                    this._send([WAMP_MSG_SPEC.UNREGISTER, reqId, this._rpcRegs[topicURI].id]);
                    this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
                    this._cache.opStatus.reqId = reqId;
                } else {
                    // there is no registration with such topicURI
                    this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG;

                    if (this._isPlainObject(callbacks) && callbacks.onError) {
                        callbacks.onError(this._cache.opStatus.description);
                    }
                }

                return this;
            }
        }]);

        return Wampy;
    }();

    return Wampy;
});
//# sourceMappingURL=wampy.js.map
