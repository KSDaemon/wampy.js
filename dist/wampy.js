"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wampy = void 0;
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var JsonSerializer_1 = require("./serializers/JsonSerializer");
/**
 *
 */
/**
 * WAMP Client Class
 */
var Wampy = /** @class */ (function () {
    /**
     * @param url Ws URL
     * @param options Wampy Options
     */
    function Wampy(url, options) {
        if (options === void 0) { options = {}; }
        this.version = "v6.4.2";
        this._url = typeof url === "string" ? url : null;
        this._protocols = ["wamp.2.json"];
        this._wamp_features = {
            agent: "Wampy.js " + this.version,
            roles: {
                publisher: {
                    features: {
                        subscriber_blackwhite_listing: true,
                        publisher_exclusion: true,
                        publisher_identification: true,
                    },
                },
                subscriber: {
                    features: {
                        pattern_based_subscription: true,
                        publication_trustlevels: true,
                        publisher_identification: true,
                    },
                },
                caller: {
                    features: {
                        caller_identification: true,
                        progressive_call_results: true,
                        call_canceling: true,
                        call_timeout: true,
                    },
                },
                callee: {
                    features: {
                        caller_identification: true,
                        call_trustlevels: true,
                        pattern_based_registration: true,
                        shared_registration: true,
                    },
                },
            },
        };
        this._cache = {
            sessionId: null,
            reqId: 0,
            serverWampFeatures: { roles: {} },
            isSayingGoodbye: false,
            opStatus: { code: 0, description: "Success!", reqId: 0 },
            timer: null,
            reconnectingAttempts: 0,
        };
        this._ws = null;
        this._wsQueue = [];
        this._requests = {};
        this._calls = {};
        this._subscriptions = {};
        this._subsTopics = new Set();
        this._rpcRegs = {};
        this._rpcNames = new Set();
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
             * @type {string}
             */
            realm: null,
            /**
             * Custom attributes to send to router on hello
             * @type {Dict}
             */
            helloCustomDetails: null,
            /**
             * Validation of the topic URI structure
             * @type {string} - strict or loose
             */
            uriValidation: "strict",
            /**
             * Authentication id to use in challenge
             * @type {string}
             */
            authid: null,
            /**
             * Supported authentication methods
             * @type {any[]}
             */
            authmethods: [],
            /**
             * onChallenge callback
             * @type {Callback}
             */
            onChallenge: null,
            /**
             * onConnect callback
             * @type {Callback}
             */
            onConnect: null,
            /**
             * onClose callback
             * @type {Callback}
             */
            onClose: null,
            /**
             * onError callback
             * @type {ErrorCallback}
             */
            onError: null,
            /**
             * onReconnect callback
             * @type {Callback}
             */
            onReconnect: null,
            /**
             * onReconnectSuccess callback
             * @type {Callback}
             */
            onReconnectSuccess: null,
            /**
             * User provided WebSocket class
             * @type {function}
             */
            ws: null,
            /**
             * User provided additional HTTP headers (for use in Node.js enviroment)
             * @type {Dict}
             */
            additionalHeaders: null,
            /**
             * User provided WS Client Config Options (for use in Node.js enviroment)
             * @type {Dict}
             */
            wsRequestOptions: null,
            /**
             * User provided msgpack class
             * @type {Dict<Callback>}
             */
            serializer: new JsonSerializer_1.JsonSerializer(),
        };
        if (this._isPlainObject(options)) {
            this._options = this._merge(this._options, options);
        }
        else if (this._isPlainObject(url)) {
            this._options = this._merge(this._options, url);
        }
        if (this._url) {
            this.connect();
        }
    }
    /* Internal utils methods */
    /**
     * Internal logger for debugging
     * @param args Args to pass into `console.log`
     * @internal
     * @protected
     */
    Wampy.prototype._log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this._options.debug) {
            console.log(args);
        }
    };
    /**
     * Get the new unique request id
     * @internal
     * @protected
     */
    Wampy.prototype._getReqId = function () {
        return ++this._cache.reqId;
    };
    /**
     * Merge argument objects into one
     * @param args - Objects to merge into one
     * @internal
     * @protected
     */
    Wampy.prototype._merge = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var obj = {};
        var len = args.length;
        for (var i = 0; i < len; i++) {
            for (var attr in args[i]) {
                obj[attr] = args[i][attr];
            }
        }
        return obj;
    };
    /**
     * Checks if a value is an array
     * @param obj - value to check
     * @internal
     * @protected
     */
    Wampy.prototype._isArray = function (obj) {
        return !!obj && Array.isArray(obj);
    };
    /**
     * Checks if a value is an object literal
     * @param obj Value to check
     * @internal
     * @protected
     */
    Wampy.prototype._isPlainObject = function (obj) {
        if (!this._isObject(obj)) {
            return false;
        }
        // If has modified constructor
        var constructor = obj === null || obj === void 0 ? void 0 : obj.constructor;
        if (typeof constructor !== "function") {
            return false;
        }
        // If has modified prototype
        var proto = constructor.prototype;
        if (this._isObject(proto) === false) {
            return false;
        }
        // If constructor does not have an Object-specific method
        if (Object.hasOwnProperty.call(proto, "isPrototypeOf") === false) {
            return false;
        }
        return true;
    };
    /**
     * Check if value is an object
     * @param obj Value to check
     * @internal
     * @protected
     */
    Wampy.prototype._isObject = function (obj) {
        return (obj !== null &&
            typeof obj === "object" &&
            Array.isArray(obj) === false &&
            Object.prototype.toString.call(obj) === "[object Object]");
    };
    /**
     * Fix websocket protocols based on options
     * @protected
     */
    Wampy.prototype._setWsProtocols = function () {
        if (!(this._options.serializer instanceof JsonSerializer_1.JsonSerializer)) {
            this._protocols.unshift("wamp.2." + this._options.serializer.protocol);
        }
    };
    /**
     * Prerequisite checks for any wampy api call
     * @param topicType
     * @param role
     * @param callbacks
     * @protected
     */
    Wampy.prototype._preReqChecks = function (topicType, role, callbacks) {
        var flag = true;
        if (this._cache.sessionId &&
            !this._cache.serverWampFeatures.roles[role]) {
            this._cache.opStatus =
                constants_1.WAMP_ERROR_MSG[("NO_" + role.toUpperCase())];
            flag = false;
        }
        if (topicType &&
            !this._validateURI(topicType.topic, topicType.patternBased, topicType.allowWAMP)) {
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.URI_ERROR;
            flag = false;
        }
        if (flag) {
            return true;
        }
        // @ts-ignore
        if (this._isPlainObject(callbacks) && callbacks.onError) {
            // @ts-ignore
            callbacks.onError({ error: this._cache.opStatus.description });
        }
        return false;
    };
    /**
     * Validate uri
     * @param uri Uri of the topic
     * @param patternBased boolean
     * @param allowWAMP boolean
     * @protected
     */
    Wampy.prototype._validateURI = function (uri, patternBased, allowWAMP) {
        var reBase;
        var rePattern;
        if (this._options.uriValidation === "strict") {
            reBase = /^([0-9a-zA-Z_]+\.)*([0-9a-zA-Z_]+)$/;
            rePattern = /^([0-9a-zA-Z_]+\.{1,2})*([0-9a-zA-Z_]+)$/;
        }
        else if (this._options.uriValidation === "loose") {
            reBase = /^([^\s.#]+\.)*([^\s.#]+)$/;
            rePattern = /^([^\s.#]+\.{1,2})*([^\s.#]+)$/;
        }
        else {
            return false;
        }
        var re = patternBased ? rePattern : reBase;
        if (allowWAMP) {
            return re.test(uri);
        }
        else {
            return !(!re.test(uri) || uri.indexOf("wamp.") === 0);
        }
    };
    /**
     * Encode WAMP message
     * @param msg Array of messages to encode
     * @protected
     */
    Wampy.prototype._encode = function (msg) {
        try {
            return this._options.serializer.encode(msg);
        }
        catch (e) {
            this._hardClose("wamp.error.protocol_violation", "Can not encode message");
        }
    };
    /**
     * Decode WAMP message
     * @param msg Message to decode
     * @protected
     */
    Wampy.prototype._decode = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._options.serializer.decode(msg)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Hard close of connection due to protocol violations
     * @param errorUri url of the error
     * @param details Details about the error
     * @protected
     */
    Wampy.prototype._hardClose = function (errorUri, details) {
        this._log("[wampy] " + details);
        // Cleanup outgoing message queue
        this._wsQueue = [];
        this._send([constants_1.WAMP_MSG_SPEC.ABORT, { message: details }, errorUri]);
        if (this._options.onError) {
            this._options.onError({ error: errorUri, details: details });
        }
        this._ws.close();
    };
    /**
     * Send encoded message to server
     * @param msg Message to send to server
     * @protected
     */
    Wampy.prototype._send = function (msg) {
        if (msg) {
            this._wsQueue.push(this._encode(msg));
        }
        if (this._ws && this._ws.readyState === 1 && this._cache.sessionId) {
            while (this._wsQueue.length) {
                this._ws.send(this._wsQueue.shift());
            }
        }
    };
    /**
     * Reset internal state and cache
     * @protected
     */
    Wampy.prototype._resetState = function () {
        this._wsQueue = [];
        this._subscriptions = {};
        this._subsTopics = new Set();
        this._requests = {};
        this._calls = {};
        this._rpcRegs = {};
        this._rpcNames = new Set();
        // Just keep attrs that are have to be present
        this._cache = {
            reqId: 0,
            reconnectingAttempts: 0,
        };
    };
    /**
     * Initialize internal websocket callbacks
     * @protected
     */
    Wampy.prototype._initWsCallbacks = function () {
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
    };
    /**
     * Internal websocket on open callback
     * @protected
     */
    Wampy.prototype._wsOnOpen = function () {
        var _a;
        var options = this._merge(this._options.helloCustomDetails, this._wamp_features), serverProtocol = ((_a = this._ws) === null || _a === void 0 ? void 0 : _a.protocol)
            ? this._ws.protocol.split(".")[2]
            : "";
        if (this._options.authid) {
            options.authmethods = this._options.authmethods;
            options.authid = this._options.authid;
        }
        this._log("[wampy] websocket connected");
        if (this._options.serializer.protocol !== serverProtocol) {
            // Server have chosen not our preferred protocol
            // Falling back to json if possible
            //FIXME Temp hack for React Native Environment.
            // Due to bug (facebook/react-native#24796), it doesn't provide selected subprotocol.
            // Remove when ^^^ bug will be fixed.
            if (serverProtocol === "json" ||
                (typeof navigator != "undefined" &&
                    navigator.product === "ReactNative" &&
                    typeof this._ws.protocol === "undefined")) {
                this._options.serializer = new JsonSerializer_1.JsonSerializer();
            }
            else {
                this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NO_SERIALIZER_AVAILABLE;
                return this;
            }
        }
        if (this._options.serializer.isBinary) {
            this._ws.binaryType = "arraybuffer";
        }
        // WAMP SPEC: [HELLO, Realm|uri, Details|dict]
        // Sending directly 'cause it's a hello msg and no sessionId check is needed
        this._ws.send(this._encode([constants_1.WAMP_MSG_SPEC.HELLO, this._options.realm, options]));
        return this;
    };
    /**
     * Internal websocket on close callback
     * @param event
     * @protected
     */
    Wampy.prototype._wsOnClose = function (event) {
        var _this = this;
        this._log("[wampy] websocket disconnected. Info: ", event);
        // Automatic reconnection
        if ((this._cache.sessionId || this._cache.reconnectingAttempts) &&
            this._options.autoReconnect &&
            (this._options.maxRetries === 0 ||
                this._cache.reconnectingAttempts < this._options.maxRetries) &&
            !this._cache.isSayingGoodbye) {
            this._cache.sessionId = null;
            this._cache.timer = setTimeout(function () {
                _this._wsReconnect();
            }, this._options.reconnectInterval);
        }
        else {
            // No reconnection needed or reached max retries count
            if (this._options.onClose) {
                this._options.onClose();
            }
            this._resetState();
            this._ws = {};
        }
    };
    /**
     * Internal websocket onEvent callback
     * @param event Event for callback
     * @protected
     */
    Wampy.prototype._wsOnMessage = function (event) {
        var _this = this;
        this._decode(event.data).then(function (data) {
            _this._log("[wampy] websocket message received: ", data);
            var id, i, p, self = _this;
            switch (data[0]) {
                case constants_1.WAMP_MSG_SPEC.WELCOME:
                    // WAMP SPEC: [WELCOME, Session|id, Details|dict]
                    if (_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received WELCOME message after session was established");
                    }
                    else {
                        _this._cache.sessionId = data[1];
                        _this._cache.serverWampFeatures = data[2];
                        if (_this._cache.reconnectingAttempts) {
                            // There was reconnection
                            _this._cache.reconnectingAttempts = 0;
                            if (_this._options.onReconnectSuccess) {
                                _this._options.onReconnectSuccess(data[2]);
                            }
                            // Let's renew all previous state
                            _this._renewSubscriptions();
                            _this._renewRegistrations();
                        }
                        else {
                            // Firing onConnect event on real connection to WAMP server
                            if (_this._options.onConnect) {
                                _this._options.onConnect(data[2]);
                            }
                        }
                        // Send local queue if there is something out there
                        _this._send();
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.ABORT:
                    // WAMP SPEC: [ABORT, Details|dict, Reason|uri]
                    if (_this._options.onError) {
                        _this._options.onError({
                            error: data[2],
                            details: data[1],
                        });
                    }
                    _this._ws.close();
                    break;
                case constants_1.WAMP_MSG_SPEC.CHALLENGE:
                    // WAMP SPEC: [CHALLENGE, AuthMethod|string, Extra|dict]
                    if (_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received CHALLENGE message after session was established");
                    }
                    else {
                        if (_this._options.authid &&
                            typeof _this._options.onChallenge === "function") {
                            p = new Promise(function (resolve, reject) {
                                resolve(_this._options.onChallenge(data[1], data[2]));
                            });
                            p.then(function (key) {
                                // Sending directly 'cause it's a challenge msg and no sessionId check is needed
                                _this._ws.send(_this._encode([
                                    constants_1.WAMP_MSG_SPEC.AUTHENTICATE,
                                    key,
                                    {},
                                ]));
                            }).catch(function (e) {
                                _this._ws.send(_this._encode([
                                    constants_1.WAMP_MSG_SPEC.ABORT,
                                    {
                                        message: "Exception in onChallenge handler raised!",
                                    },
                                    "wamp.error.cannot_authenticate",
                                ]));
                                if (_this._options.onError) {
                                    _this._options.onError({
                                        error: constants_1.WAMP_ERROR_MSG.CRA_EXCEPTION
                                            .description,
                                    });
                                }
                                _this._ws.close();
                                _this._cache.opStatus =
                                    constants_1.WAMP_ERROR_MSG.CRA_EXCEPTION;
                            });
                        }
                        else {
                            _this._ws.send(_this._encode([
                                constants_1.WAMP_MSG_SPEC.ABORT,
                                {
                                    message: constants_1.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID
                                        .description,
                                },
                                "wamp.error.cannot_authenticate",
                            ]));
                            if (_this._options.onError) {
                                _this._options.onError({
                                    error: constants_1.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID
                                        .description,
                                });
                            }
                            _this._ws.close();
                            _this._cache.opStatus =
                                constants_1.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID;
                        }
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.GOODBYE:
                    // WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received GOODBYE message before session was established");
                    }
                    else {
                        if (!_this._cache.isSayingGoodbye) {
                            // get goodbye, initiated by server
                            _this._cache.isSayingGoodbye = true;
                            _this._send([
                                constants_1.WAMP_MSG_SPEC.GOODBYE,
                                {},
                                "wamp.close.goodbye_and_out",
                            ]);
                        }
                        _this._cache.sessionId = null;
                        _this._ws.close();
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.ERROR:
                    // WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict,
                    //             Error|uri, (Arguments|list, ArgumentsKw|dict)]
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received ERROR message before session was established");
                    }
                    else {
                        switch (data[1]) {
                            case constants_1.WAMP_MSG_SPEC.SUBSCRIBE:
                            case constants_1.WAMP_MSG_SPEC.UNSUBSCRIBE:
                            case constants_1.WAMP_MSG_SPEC.PUBLISH:
                            case constants_1.WAMP_MSG_SPEC.REGISTER:
                            case constants_1.WAMP_MSG_SPEC.UNREGISTER:
                                _this._requests[data[2]] &&
                                    _this._requests[data[2]].callbacks
                                        .onError &&
                                    _this._requests[data[2]].callbacks.onError({
                                        error: data[4],
                                        details: data[3],
                                        argsList: data[5],
                                        argsDict: data[6],
                                    });
                                delete _this._requests[data[2]];
                                break;
                            // case WAMP_MSG_SPEC.INVOCATION:
                            //     break;
                            case constants_1.WAMP_MSG_SPEC.CALL:
                                // WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict,
                                //             Error|uri, Arguments|list, ArgumentsKw|dict]
                                _this._calls[data[2]] &&
                                    _this._calls[data[2]].onError &&
                                    _this._calls[data[2]].onError({
                                        error: data[4],
                                        details: data[3],
                                        argsList: data[5],
                                        argsDict: data[6],
                                    });
                                delete _this._calls[data[2]];
                                break;
                            default:
                                _this._hardClose("wamp.error.protocol_violation", "Received invalid ERROR message");
                                break;
                        }
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.SUBSCRIBED:
                    // WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received SUBSCRIBED message before session was established");
                    }
                    else {
                        if (_this._requests[data[1]]) {
                            _this._subscriptions[_this._requests[data[1]].topic] = _this._subscriptions[data[2]] = {
                                id: data[2],
                                callbacks: [
                                    _this._requests[data[1]].callbacks
                                        .onEvent,
                                ],
                                advancedOptions: _this._requests[data[1]].advancedOptions,
                            };
                            _this._subsTopics.add(_this._requests[data[1]].topic);
                            if (_this._requests[data[1]].callbacks.onSuccess) {
                                _this._requests[data[1]].callbacks.onSuccess({
                                    topic: _this._requests[data[1]]
                                        .topic,
                                    requestId: data[1],
                                    subscriptionId: data[2],
                                });
                            }
                            delete _this._requests[data[1]];
                        }
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.UNSUBSCRIBED:
                    // WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received UNSUBSCRIBED message before session was established");
                    }
                    else {
                        if (_this._requests[data[1]]) {
                            id =
                                _this._subscriptions[_this._requests[data[1]].topic].id;
                            delete _this._subscriptions[_this._requests[data[1]].topic];
                            delete _this._subscriptions[id];
                            if (_this._subsTopics.has(_this._requests[data[1]].topic)) {
                                _this._subsTopics.delete(_this._requests[data[1]].topic);
                            }
                            if (_this._requests[data[1]].callbacks.onSuccess) {
                                _this._requests[data[1]].callbacks.onSuccess({
                                    topic: _this._requests[data[1]]
                                        .topic,
                                    requestId: data[1],
                                });
                            }
                            delete _this._requests[data[1]];
                        }
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.PUBLISHED:
                    // WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received PUBLISHED message before session was established");
                    }
                    else {
                        if (_this._requests[data[1]]) {
                            if (_this._requests[data[1]].callbacks &&
                                _this._requests[data[1]].callbacks.onSuccess) {
                                _this._requests[data[1]].callbacks.onSuccess({
                                    topic: _this._requests[data[1]]
                                        .topic,
                                    requestId: data[1],
                                    publicationId: data[2],
                                });
                            }
                            delete _this._requests[data[1]];
                        }
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.EVENT:
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received EVENT message before session was established");
                    }
                    else {
                        if (_this._subscriptions[data[1]]) {
                            // WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id,
                            //             Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]
                            i =
                                _this._subscriptions[data[1]].callbacks
                                    .length;
                            while (i--) {
                                _this._subscriptions[data[1]].callbacks[i]({
                                    details: data[3],
                                    argsList: data[4],
                                    argsDict: data[5],
                                });
                            }
                        }
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.RESULT:
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received RESULT message before session was established");
                    }
                    else {
                        if (_this._calls[data[1]]) {
                            // WAMP SPEC: [RESULT, CALL.Request|id, Details|dict,
                            //             YIELD.Arguments|list, YIELD.ArgumentsKw|dict]
                            _this._calls[data[1]].onSuccess({
                                details: data[2],
                                argsList: data[3],
                                argsDict: data[4],
                            });
                            if (!(data[2].progress &&
                                data[2].progress === true)) {
                                // We receive final result (progressive or not)
                                delete _this._calls[data[1]];
                            }
                        }
                    }
                    break;
                // case WAMP_MSG_SPEC.REGISTER:
                //     // WAMP SPEC:
                //     break;
                case constants_1.WAMP_MSG_SPEC.REGISTERED:
                    // WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received REGISTERED message before session was established");
                    }
                    else {
                        if (_this._requests[data[1]]) {
                            _this._rpcRegs[_this._requests[data[1]].topic] =
                                _this._rpcRegs[data[2]] = {
                                    id: data[2],
                                    callbacks: [
                                        _this._requests[data[1]].callbacks
                                            .rpc,
                                    ],
                                };
                            _this._rpcNames.add(_this._requests[data[1]].topic);
                            if (_this._requests[data[1]].callbacks &&
                                _this._requests[data[1]].callbacks.onSuccess) {
                                _this._requests[data[1]].callbacks.onSuccess({
                                    topic: _this._requests[data[1]]
                                        .topic,
                                    requestId: data[1],
                                    registrationId: data[2],
                                });
                            }
                            delete _this._requests[data[1]];
                        }
                    }
                    break;
                // case WAMP_MSG_SPEC.UNREGISTER:
                //     // WAMP SPEC:
                //     break;
                case constants_1.WAMP_MSG_SPEC.UNREGISTERED:
                    // WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received UNREGISTERED message before session was established");
                    }
                    else {
                        if (_this._requests[data[1]]) {
                            id =
                                _this._rpcRegs[_this._requests[data[1]].topic]
                                    .id;
                            delete _this._rpcRegs[_this._requests[data[1]].topic];
                            delete _this._rpcRegs[id];
                            if (_this._rpcNames.has(_this._requests[data[1]].topic)) {
                                _this._rpcNames.delete(_this._requests[data[1]].topic);
                            }
                            if (_this._requests[data[1]].callbacks &&
                                _this._requests[data[1]].callbacks.onSuccess) {
                                _this._requests[data[1]].callbacks.onSuccess({
                                    topic: _this._requests[data[1]]
                                        .topic,
                                    requestId: data[1],
                                });
                            }
                            delete _this._requests[data[1]];
                        }
                    }
                    break;
                case constants_1.WAMP_MSG_SPEC.INVOCATION:
                    if (!_this._cache.sessionId) {
                        _this._hardClose("wamp.error.protocol_violation", "Received INVOCATION message before session was established");
                    }
                    else {
                        if (_this._rpcRegs[data[2]]) {
                            // WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id,
                            //             Details|dict, CALL.Arguments|list, CALL.ArgumentsKw|dict]
                            var invoke_result_handler_1 = function (results) {
                                // WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, (Arguments|list,
                                // ArgumentsKw|dict)]
                                var msg = [
                                    constants_1.WAMP_MSG_SPEC.YIELD,
                                    data[1],
                                    {},
                                ];
                                if (self._isPlainObject(results)) {
                                    if (self._isPlainObject(results.options)) {
                                        msg[2] = results.options;
                                    }
                                    if (self._isArray(results.argsList)) {
                                        msg.push(results.argsList);
                                    }
                                    else if (typeof results.argsList !==
                                        "undefined") {
                                        msg.push([results.argsList]);
                                    }
                                    if (self._isPlainObject(results.argsDict)) {
                                        if (msg.length === 3) {
                                            msg.push([]);
                                        }
                                        msg.push(results.argsDict);
                                    }
                                }
                                else {
                                    msg = [
                                        constants_1.WAMP_MSG_SPEC.YIELD,
                                        data[1],
                                        {},
                                    ];
                                }
                                self._send(msg);
                            }, invoke_error_handler_1 = function (_a) {
                                var details = _a.details, error = _a.error, argsList = _a.argsList, argsDict = _a.argsDict;
                                var msg = [
                                    constants_1.WAMP_MSG_SPEC.ERROR,
                                    constants_1.WAMP_MSG_SPEC.INVOCATION,
                                    data[1],
                                    details || {},
                                    error ||
                                        "wamp.error.invocation_exception",
                                ];
                                if (argsList &&
                                    self._isArray(argsList)) {
                                    msg.push(argsList);
                                }
                                if (argsDict &&
                                    self._isPlainObject(argsDict)) {
                                    if (msg.length === 5) {
                                        msg.push([]);
                                    }
                                    msg.push(argsDict);
                                }
                                self._send(msg);
                            };
                            p = new Promise(function (resolve, reject) {
                                resolve(_this._rpcRegs[data[2]].callbacks[0]({
                                    details: data[3],
                                    argsList: data[4],
                                    argsDict: data[5],
                                    result_handler: invoke_result_handler_1,
                                    error_handler: invoke_error_handler_1,
                                }));
                            });
                            p.then(function (results) {
                                invoke_result_handler_1(results);
                            }).catch(function (e) {
                                invoke_error_handler_1(e);
                            });
                        }
                        else {
                            // WAMP SPEC: [ERROR, INVOCATION, INVOCATION.Request|id, Details|dict, Error|uri]
                            _this._send([
                                constants_1.WAMP_MSG_SPEC.ERROR,
                                constants_1.WAMP_MSG_SPEC.INVOCATION,
                                data[1],
                                {},
                                "wamp.error.no_such_procedure",
                            ]);
                            _this._cache.opStatus =
                                constants_1.WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION;
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
                    _this._hardClose("wamp.error.protocol_violation", "Received non-compliant WAMP message");
                    break;
            }
        }, function (_err) {
            _this._hardClose("wamp.error.protocol_violation", "Can not decode received message");
        });
    };
    /**
     * Internal websocket on error callback
     * @param error Error arg to pass into onError callback
     * @protected
     */
    Wampy.prototype._wsOnError = function (error) {
        this._log("[wampy] websocket error");
        if (this._options.onError) {
            this._options.onError(error);
        }
    };
    /**
     * Reconnect to server in case of websocket error
     * @protected
     */
    Wampy.prototype._wsReconnect = function () {
        this._log("[wampy] websocket reconnecting...");
        if (this._options.onReconnect) {
            this._options.onReconnect();
        }
        this._cache.reconnectingAttempts++;
        this._ws = (0, utils_1.getWebSocket)(this._url, this._protocols, this._options.ws, this._options.additionalHeaders, this._options.wsRequestOptions);
        this._initWsCallbacks();
    };
    /**
     * Resubscribe to topics in case of communication error
     * @protected
     */
    Wampy.prototype._renewSubscriptions = function () {
        var i;
        var subs = this._subscriptions, st = this._subsTopics;
        this._subscriptions = {};
        this._subsTopics = new Set();
        // @ts-ignore
        for (var _i = 0, st_1 = st; _i < st_1.length; _i++) {
            var topic = st_1[_i];
            i = subs[topic].callbacks.length;
            while (i--) {
                this.subscribe(topic, subs[topic].callbacks[i], subs[topic].advancedOptions);
            }
        }
    };
    /**
     * Reregister RPCs in case of communication error
     * @protected
     */
    Wampy.prototype._renewRegistrations = function () {
        var rpcs = this._rpcRegs, rn = this._rpcNames;
        this._rpcRegs = {};
        this._rpcNames = new Set();
        for (var _i = 0, _a = Array.from(rn); _i < _a.length; _i++) {
            var rpcName = _a[_i];
            this.register(rpcName, { rpc: rpcs[rpcName].callbacks[0] });
        }
    };
    /* Wampy public API */
    /**
     * Get or set Wampy options
     *
     * To get options - call without parameters\
     * To set options - pass hash-table with options values
     * @param opts WampyOptions to merge with current options
     */
    Wampy.prototype.options = function (opts) {
        if (typeof opts === "undefined") {
        }
        else if (this._isPlainObject(opts)) {
            this._options = this._merge(this._options, opts);
            return this;
        }
        return this._options;
    };
    /**
     * Get the status of last operation
     */
    Wampy.prototype.getOpStatus = function () {
        return this._cache.opStatus;
    };
    /**
     * Get the WAMP Session ID
     */
    Wampy.prototype.getSessionId = function () {
        return this._cache.sessionId;
    };
    /**
     * Connect to server
     * @param url New url (optional)
     */
    Wampy.prototype.connect = function (url) {
        if (url) {
            this._url = url;
        }
        if (this._options.realm) {
            var authp = (this._options.authid ? 1 : 0) +
                (this._isArray(this._options.authmethods) &&
                    this._options.authmethods.length
                    ? 1
                    : 0) +
                (typeof this._options.onChallenge === "function" ? 1 : 0);
            if (authp > 0 && authp < 3) {
                this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID;
                return this;
            }
            this._setWsProtocols();
            this._ws = (0, utils_1.getWebSocket)(this._url, this._protocols, this._options.ws, this._options.additionalHeaders, this._options.wsRequestOptions);
            if (!this._ws) {
                this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NO_WS_OR_URL;
                return this;
            }
            this._initWsCallbacks();
        }
        else {
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NO_REALM;
        }
        return this;
    };
    /**
     * Disconnect from server
     */
    Wampy.prototype.disconnect = function () {
        if (this._cache.sessionId) {
            // need to send goodbye message to server
            this._cache.isSayingGoodbye = true;
            this._send([
                constants_1.WAMP_MSG_SPEC.GOODBYE,
                {},
                "wamp.close.system_shutdown",
            ]);
        }
        else if (this._ws) {
            this._ws.close();
        }
        this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
        return this;
    };
    /**
     * Abort WAMP session establishment
     */
    Wampy.prototype.abort = function () {
        if (!this._cache.sessionId && this._ws.readyState === 1) {
            this._send([constants_1.WAMP_MSG_SPEC.ABORT, {}, "wamp.error.abort"]);
            this._cache.sessionId = null;
        }
        this._ws.close();
        this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
        return this;
    };
    /**
     * Subscribe to a topic on a broker
     * @param topicURI - Uri to subscribe to
     * @param callbacks - if it is a function, it will be treated as published event callback or it can be hash table of callbacks
     * @param  advancedOptions - optional parameter
     */
    Wampy.prototype.subscribe = function (topicURI, callbacks, advancedOptions) {
        var reqId, patternBased = false;
        var options = {};
        if (typeof advancedOptions !== "undefined" &&
            this._isPlainObject(advancedOptions) &&
            Object.prototype.hasOwnProperty.call(advancedOptions, "match")) {
            if (/prefix|wildcard/.test(advancedOptions.match)) {
                options.match = advancedOptions.match;
                patternBased = true;
            }
        }
        if (!this._preReqChecks({
            topic: topicURI,
            patternBased: patternBased,
            allowWAMP: true,
        }, "broker", callbacks)) {
            return this;
        }
        if (typeof callbacks === "function") {
            callbacks = { onEvent: callbacks };
        }
        else if (!this._isPlainObject(callbacks) ||
            typeof callbacks.onEvent === "undefined") {
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NO_CALLBACK_SPEC;
            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }
            return this;
        }
        if (!this._subscriptions[topicURI] ||
            !this._subscriptions[topicURI].callbacks.length) {
            // no such subscription or processing unsubscribing
            reqId = this._getReqId();
            this._requests[reqId] = {
                topic: topicURI,
                callbacks: callbacks,
                advancedOptions: advancedOptions,
            };
            // WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
            this._send([constants_1.WAMP_MSG_SPEC.SUBSCRIBE, reqId, options, topicURI]);
        }
        else {
            // already have subscription to this topic
            // There is no such callback yet
            if (this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent) < 0) {
                this._subscriptions[topicURI].callbacks.push(callbacks.onEvent);
            }
            if (callbacks.onSuccess) {
                callbacks.onSuccess({
                    topic: topicURI,
                    subscriptionId: this._subscriptions[topicURI].id,
                });
            }
        }
        this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return this;
    };
    /**
     * Unsubscribe from topic
     * @param topicURI Topic to unsubscribe from
     * @param callbacks - if it is a function, it will be treated as published event callback to remove. Or it can be hash table of callbacks
     */
    Wampy.prototype.unsubscribe = function (topicURI, callbacks) {
        var reqId, i = -1;
        // @ts-ignore
        if (!this._preReqChecks(null, "broker", callbacks)) {
            return this;
        }
        if (this._subscriptions[topicURI]) {
            reqId = this._getReqId();
            if (typeof callbacks === "undefined") {
                this._subscriptions[topicURI].callbacks = [];
                callbacks = {};
            }
            else if (typeof callbacks === "function") {
                i = this._subscriptions[topicURI].callbacks.indexOf(callbacks);
                callbacks = {};
            }
            else if (callbacks.onEvent &&
                typeof callbacks.onEvent === "function") {
                i = this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent);
            }
            else {
                this._subscriptions[topicURI].callbacks = [];
            }
            if (i >= 0) {
                this._subscriptions[topicURI].callbacks.splice(i, 1);
            }
            if (this._subscriptions[topicURI].callbacks.length) {
                // There are another callbacks for this topic
                this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
                return this;
            }
            this._requests[reqId] = {
                topic: topicURI,
                callbacks: callbacks,
            };
            // WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]
            this._send([
                constants_1.WAMP_MSG_SPEC.UNSUBSCRIBE,
                reqId,
                this._subscriptions[topicURI].id,
            ]);
        }
        else {
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE;
            // @ts-ignore
            if (this._isPlainObject(callbacks) && callbacks.onError) {
                // @ts-ignore
                callbacks.onError({ error: this._cache.opStatus.description });
            }
            return this;
        }
        this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return this;
    };
    /**
     * Publish a event to topic
     * @param topicURI
     * @param payload - payload to publish
     * @param callbacks - optional hash table of callbacks:
     * @param advancedOptions - optional parameter
     */
    Wampy.prototype.publish = function (topicURI, payload, callbacks, advancedOptions) {
        var _this = this;
        var reqId, msg, err = false, hasPayload = false;
        var options = {}, _optionsConvertHelper = function (option, sourceType) {
            if (advancedOptions && advancedOptions[option]) {
                if (_this._isArray(advancedOptions[option]) &&
                    // @ts-ignore
                    advancedOptions[option].length) {
                    options[option] = advancedOptions[option];
                }
                else if (typeof advancedOptions[option] === sourceType) {
                    options[option] = [advancedOptions[option]];
                }
                else {
                    err = true;
                }
            }
        };
        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: false }, "broker", callbacks)) {
            return this;
        }
        if (this._isPlainObject(callbacks)) {
            options.acknowledge = true;
        }
        if (typeof advancedOptions !== "undefined") {
            if (this._isPlainObject(advancedOptions)) {
                _optionsConvertHelper("exclude", "number");
                _optionsConvertHelper("exclude_authid", "string");
                _optionsConvertHelper("exclude_authrole", "string");
                _optionsConvertHelper("eligible", "number");
                _optionsConvertHelper("eligible_authid", "string");
                _optionsConvertHelper("eligible_authrole", "string");
                if (Object.hasOwnProperty.call(advancedOptions, "exclude_me")) {
                    options.exclude_me = advancedOptions.exclude_me !== false;
                }
                if (Object.hasOwnProperty.call(advancedOptions, "disclose_me")) {
                    options.disclose_me = advancedOptions.disclose_me === true;
                }
            }
            else {
                err = true;
            }
            if (err) {
                this._cache.opStatus = constants_1.WAMP_ERROR_MSG.INVALID_PARAM;
                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    callbacks.onError({
                        error: this._cache.opStatus.description,
                    });
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
                    callbacks: callbacks,
                };
                hasPayload = true;
                break;
        }
        // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri]
        msg = [constants_1.WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI];
        if (hasPayload) {
            // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
            if (this._isArray(payload)) {
                msg.push(payload);
            }
            else if (this._isPlainObject(payload)) {
                // It's a wampy unified form of payload passing
                if (payload.argsList || payload.argsDict) {
                    if (payload.argsList) {
                        msg.push(payload.argsList);
                    }
                    if (payload.argsDict) {
                        if (msg.length === 4) {
                            msg.push([]);
                        }
                        msg.push(payload.argsDict);
                    }
                }
                else {
                    msg.push([], payload);
                }
            }
            else {
                // assume it's a single value
                msg.push([payload]);
            }
        }
        this._send(msg);
        this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return this;
    };
    /**
     * Remote Procedure Call
     * @param topicURI - Uri to call
     * @param payload - Payload to call with
     * @param  callbacks - if it is a function, it will be treated `as onSuccess` callback function, or hash table of callbacks
     * @param advancedOptions - optional parameter. Must include any or all of the options:
     * ```ts
     * {
     *      disclose_me: boolean // flag of disclosure of Caller identity (WAMP session ID) to endpoints of a routed call
     *      receive_progress: boolean // flag for receiving progressive results. In this case onSuccess function will be called every time on receiving result
     *      timeout: number // (in ms) for the call to finish
     * }
     * ```
     * @returns {this}
     */
    Wampy.prototype.call = function (topicURI, payload, callbacks, advancedOptions) {
        var reqId, msg, err = false;
        var options = {};
        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: true }, "dealer", callbacks)) {
            return this;
        }
        if (typeof callbacks === "function") {
            callbacks = { onSuccess: callbacks };
        }
        else if (!this._isPlainObject(callbacks) ||
            typeof callbacks.onSuccess === "undefined") {
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NO_CALLBACK_SPEC;
            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }
            return this;
        }
        if (typeof advancedOptions !== "undefined") {
            if (this._isPlainObject(advancedOptions)) {
                if (Object.hasOwnProperty.call(advancedOptions, "disclose_me")) {
                    options.disclose_me = advancedOptions.disclose_me === true;
                }
                if (Object.hasOwnProperty.call(advancedOptions, "receive_progress")) {
                    options.receive_progress =
                        advancedOptions.receive_progress === true;
                }
                if (Object.hasOwnProperty.call(advancedOptions, "timeout")) {
                    if (typeof advancedOptions.timeout === "number") {
                        options.timeout = advancedOptions.timeout;
                    }
                    else {
                        err = true;
                    }
                }
            }
            else {
                err = true;
            }
            if (err) {
                this._cache.opStatus = constants_1.WAMP_ERROR_MSG.INVALID_PARAM;
                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    callbacks.onError({
                        error: this._cache.opStatus.description,
                    });
                }
                return this;
            }
        }
        do {
            reqId = this._getReqId();
        } while (reqId in this._calls);
        this._calls[reqId] = callbacks;
        // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
        msg = [constants_1.WAMP_MSG_SPEC.CALL, reqId, options, topicURI];
        if (payload !== null && typeof payload !== "undefined") {
            if (this._isArray(payload)) {
                msg.push(payload);
            }
            else if (this._isPlainObject(payload)) {
                // It's a wampy unified form of payload passing
                if (payload.argsList || payload.argsDict) {
                    if (payload.argsList) {
                        msg.push(payload.argsList);
                    }
                    if (payload.argsDict) {
                        if (msg.length === 4) {
                            msg.push([]);
                        }
                        msg.push(payload.argsDict);
                    }
                }
                else {
                    msg.push([], payload);
                }
            }
            else {
                // assume it's a single value
                msg.push([payload]);
            }
        }
        this._send(msg);
        this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        return this;
    };
    /**
     * RPC invocation cancelling
     *
     * @param reqId RPC call request ID
     * @param callbacks - if it is a function, it will be treated as `onSuccess` callback
     * @param advancedOptions - optional parameter. Must include any or all of the options:
     * ```ts
     * {
     *      mode: "skip" | "kill" | "killnowait"// Skip is default.
     * }
     * ```
     */
    Wampy.prototype.cancel = function (reqId, callbacks, advancedOptions) {
        var _a;
        var err = false;
        var options = {};
        // @ts-ignore
        if (!this._preReqChecks(null, "dealer", callbacks)) {
            return this;
        }
        if (!reqId || !this._calls[reqId]) {
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID;
            // @ts-ignore
            if (this._isPlainObject(callbacks) && callbacks.onError) {
                // @ts-ignore
                callbacks.onError({ error: this._cache.opStatus.description });
            }
            return this;
        }
        if (typeof advancedOptions !== "undefined") {
            if (this._isPlainObject(advancedOptions)) {
                if (Object.hasOwnProperty.call(advancedOptions, "mode")) {
                    if (/skip|kill|killnowait/.test(advancedOptions.mode)) {
                        options.mode = advancedOptions.mode;
                    }
                    else {
                        err = true;
                    }
                }
            }
            else {
                err = true;
            }
            if (err) {
                this._cache.opStatus = constants_1.WAMP_ERROR_MSG.INVALID_PARAM;
                // @ts-ignore
                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    // @ts-ignore
                    callbacks.onError({
                        error: this._cache.opStatus.description,
                    });
                }
                return this;
            }
        }
        // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]
        this._send([constants_1.WAMP_MSG_SPEC.CANCEL, reqId, options]);
        this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
        // @ts-ignore
        (_a = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onSuccess) === null || _a === void 0 ? void 0 : _a.call(callbacks);
        return this;
    };
    /**
     * RPC registration for invocation
     * @param topicURI uri of the topic
     * @param  callbacks - if it is a function, it will be treated as rpc callback
     *                          or it can be hash table of callbacks:
     * ```ts
     * {
     *      rpc: Callback
     *      onSuccess: Callback
     *      onError: ErrorCallback
     * }
     * ```
     * @param advancedOptions - optional parameter
     * ```ts
     * {
     *      match: "prefix"|"wildcard";
     *      invoke: "single" | "roundrobin" | "random" | "first" | "last";
     * }
     * ```
     */
    Wampy.prototype.register = function (topicURI, 
    /**
     * if it is a function - it will be treated as rpc itself\
     * it can be hash table of callbacks
     */
    callbacks, advancedOptions) {
        var reqId, patternBased = false, err = false;
        var options = {};
        if (typeof advancedOptions !== "undefined") {
            if (this._isPlainObject(advancedOptions)) {
                if (Object.hasOwnProperty.call(advancedOptions, "match")) {
                    if (/prefix|wildcard/.test(advancedOptions.match)) {
                        options.match = advancedOptions.match;
                        patternBased = true;
                    }
                    else {
                        err = true;
                    }
                }
                if (Object.hasOwnProperty.call(advancedOptions, "invoke")) {
                    if (/single|roundrobin|random|first|last/.test(advancedOptions.invoke)) {
                        options.invoke = advancedOptions.invoke;
                    }
                    else {
                        err = true;
                    }
                }
            }
            else {
                err = true;
            }
            if (err) {
                this._cache.opStatus = constants_1.WAMP_ERROR_MSG.INVALID_PARAM;
                // @ts-ignore
                if (this._isPlainObject(callbacks) && callbacks.onError) {
                    // @ts-ignore
                    callbacks.onError({
                        error: this._cache.opStatus.description,
                    });
                }
                return this;
            }
        }
        if (!this._preReqChecks({
            topic: topicURI,
            patternBased: patternBased,
            allowWAMP: false,
        }, "dealer", callbacks)) {
            return this;
        }
        if (typeof callbacks === "function") {
            callbacks = { rpc: callbacks };
        }
        else if (!this._isPlainObject(callbacks) ||
            typeof callbacks.rpc === "undefined") {
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NO_CALLBACK_SPEC;
            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }
            return this;
        }
        if (!this._rpcRegs[topicURI] ||
            !this._rpcRegs[topicURI].callbacks.length) {
            // no such registration or processing unregistering
            reqId = this._getReqId();
            this._requests[reqId] = {
                topic: topicURI,
                callbacks: callbacks,
            };
            // WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]
            this._send([constants_1.WAMP_MSG_SPEC.REGISTER, reqId, options, topicURI]);
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
            this._cache.opStatus.reqId = reqId;
        }
        else {
            // already have registration with such topicURI
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED;
            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }
        }
        return this;
    };
    /**
     * RPC unregistration for invocation
     * @param topicURI - topic to unregister from
     * @param callbacks - if it is a function, it will treated as onSuccess callback
     */
    Wampy.prototype.unregister = function (topicURI, callbacks) {
        var reqId;
        if (typeof callbacks === "function") {
            callbacks = { onSuccess: callbacks };
        }
        if (!this._preReqChecks({ topic: topicURI, patternBased: false, allowWAMP: false }, "dealer", callbacks)) {
            return this;
        }
        if (this._rpcRegs[topicURI]) {
            // there is such registration
            reqId = this._getReqId();
            this._requests[reqId] = {
                topic: topicURI,
                callbacks: callbacks,
            };
            // WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]
            this._send([
                constants_1.WAMP_MSG_SPEC.UNREGISTER,
                reqId,
                this._rpcRegs[topicURI].id,
            ]);
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.SUCCESS;
            this._cache.opStatus.reqId = reqId;
        }
        else {
            // there is no registration with such topicURI
            this._cache.opStatus = constants_1.WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG;
            if (this._isPlainObject(callbacks) && callbacks.onError) {
                callbacks.onError({ error: this._cache.opStatus.description });
            }
        }
        return this;
    };
    return Wampy;
}());
exports.Wampy = Wampy;
exports.default = Wampy;
//# sourceMappingURL=wampy.js.map