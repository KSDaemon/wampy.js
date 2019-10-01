"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Wampy = exports["default"] = void 0;

var _constants = require("./constants");

var _utils = require("./utils");

var _JsonSerializer = require("./serializers/JsonSerializer");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * WAMP Client Class
 */
var Wampy =
/*#__PURE__*/
function () {
  /**
   * Wampy constructor
   * @param {string} [url]
   * @param {Object} [options]
   */
  function Wampy(url, options) {
    _classCallCheck(this, Wampy);

    /**
     * Wampy version
     * @type {string}
     * @private
     */
    this.version = 'v6.2.2';
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
        subscriber: {
          features: {
            pattern_based_subscription: true,
            publication_trustlevels: true
          }
        },
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
            caller_identification: true,
            call_trustlevels: true,
            pattern_based_registration: true,
            shared_registration: true
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
       * WAMP Session scope requests ID
       * @type {int}
       */
      reqId: 0,

      /**
       * Server WAMP roles and features
       */
      server_wamp_features: {
        roles: {}
      },

      /**
       * Are we in state of saying goodbye
       * @type {boolean}
       */
      isSayingGoodbye: false,

      /**
       * Status of last operation
       */
      opStatus: {
        code: 0,
        description: 'Success!',
        reqId: 0
      },

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
       * Validation of the topic URI structure
       * @type {string} - strict or loose
       */
      uriValidation: 'strict',

      /**
       * Authentication id to use in challenge
       * @type {string}
       */
      authid: null,

      /**
       * Supported authentication methods
       * @type {array}
       */
      authmethods: [],

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
       * User provided msgpack class
       * @type {object}
       */
      serializer: new _JsonSerializer.JsonSerializer()
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


  _createClass(Wampy, [{
    key: "_log",
    value: function _log() {
      if (this._options.debug) {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        console.log(args);
      }
    }
    /**
     * Get the new unique request id
     * @returns {number}
     * @private
     */

  }, {
    key: "_getReqId",
    value: function _getReqId() {
      return ++this._cache.reqId;
    }
    /**
     * Merge argument objects into one
     * @returns {Object}
     * @private
     */

  }, {
    key: "_merge",
    value: function _merge() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var obj = {},
          l = args.length;
      var i, attr;

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

  }, {
    key: "_isArray",
    value: function _isArray(obj) {
      return !!obj && Array.isArray(obj);
    }
    /**
     * Check if value is object literal
     * @param obj
     * @returns {boolean}
     * @private
     */

  }, {
    key: "_isPlainObject",
    value: function _isPlainObject(obj) {
      if (!this._isObject(obj)) {
        return false;
      } // If has modified constructor


      var ctor = obj.constructor;

      if (typeof ctor !== 'function') {
        return false;
      } // If has modified prototype


      var prot = ctor.prototype;

      if (this._isObject(prot) === false) {
        return false;
      } // If constructor does not have an Object-specific method


      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      return true;
    }
    /**
     * Check if value is an object
     * @param obj
     * @returns {boolean}
     * @private
     */

  }, {
    key: "_isObject",
    value: function _isObject(obj) {
      return obj !== null && _typeof(obj) === 'object' && Array.isArray(obj) === false && Object.prototype.toString.call(obj) === '[object Object]';
    }
    /**
     * Fix websocket protocols based on options
     * @private
     */

  }, {
    key: "_setWsProtocols",
    value: function _setWsProtocols() {
      if (!(this._options.serializer instanceof _JsonSerializer.JsonSerializer)) {
        this._protocols.unshift('wamp.2.' + this._options.serializer.protocol);
      }
    }
    /**
     * Prerequisite checks for any wampy api call
     * @param {object} topicType { topic: URI, patternBased: true|false, allowWAMP: true|false }
     * @param {string} role
     * @param {object} callbacks
     * @returns {boolean}
     * @private
     */

  }, {
    key: "_preReqChecks",
    value: function _preReqChecks(topicType, role, callbacks) {
      var flag = true;

      if (this._cache.sessionId && !this._cache.server_wamp_features.roles[role]) {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG['NO_' + role.toUpperCase()];
        flag = false;
      }

      if (topicType && !this._validateURI(topicType.topic, topicType.patternBased, topicType.allowWAMP)) {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.URI_ERROR;
        flag = false;
      }

      if (flag) {
        return true;
      }

      if (this._isPlainObject(callbacks) && callbacks.onError) {
        callbacks.onError({
          error: this._cache.opStatus.description
        });
      }

      return false;
    }
    /**
     * Validate uri
     * @param {string} uri
     * @param {boolean} patternBased
     * @param {boolean} allowWAMP
     * @returns {boolean}
     * @private
     */

  }, {
    key: "_validateURI",
    value: function _validateURI(uri, patternBased, allowWAMP) {
      var reBase;
      var rePattern;

      if (this._options.uriValidation === 'strict') {
        reBase = /^([0-9a-zA-Z_]+\.)*([0-9a-zA-Z_]+)$/;
        rePattern = /^([0-9a-zA-Z_]+\.{1,2})*([0-9a-zA-Z_]+)$/;
      } else if (this._options.uriValidation === 'loose') {
        reBase = /^([^\s.#]+\.)*([^\s.#]+)$/;
        rePattern = /^([^\s.#]+\.{1,2})*([^\s.#]+)$/;
      } else {
        return false;
      }

      var re = patternBased ? rePattern : reBase;

      if (allowWAMP) {
        return re.test(uri);
      } else {
        return !(!re.test(uri) || uri.indexOf('wamp.') === 0);
      }
    }
    /**
     * Encode WAMP message
     * @param {Array} msg
     * @returns {*}
     * @private
     */

  }, {
    key: "_encode",
    value: function _encode(msg) {
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

  }, {
    key: "_decode",
    value: function _decode(msg) {
      return this._options.serializer.decode(msg);
    }
    /**
     * Hard close of connection due to protocol violations
     * @param {string} errorUri
     * @param {string} details
     * @private
     */

  }, {
    key: "_hardClose",
    value: function _hardClose(errorUri, details) {
      this._log('[wampy] ' + details); // Cleanup outgoing message queue


      this._wsQueue = [];

      this._send([_constants.WAMP_MSG_SPEC.ABORT, {
        message: details
      }, errorUri]);

      if (this._options.onError) {
        this._options.onError({
          error: errorUri,
          details: details
        });
      }

      this._ws.close();
    }
    /**
     * Send encoded message to server
     * @param {Array} msg
     * @private
     */

  }, {
    key: "_send",
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
    key: "_resetState",
    value: function _resetState() {
      this._wsQueue = [];
      this._subscriptions = {};
      this._subsTopics = new Set();
      this._requests = {};
      this._calls = {};
      this._rpcRegs = {};
      this._rpcNames = new Set(); // Just keep attrs that are have to be present

      this._cache = {
        reqId: 0,
        reconnectingAttempts: 0
      };
    }
    /**
     * Initialize internal websocket callbacks
     * @private
     */

  }, {
    key: "_initWsCallbacks",
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
    /**
     * Internal websocket on open callback
     * @private
     */

  }, {
    key: "_wsOnOpen",
    value: function _wsOnOpen() {
      var options = this._merge(this._options.helloCustomDetails, this._wamp_features),
          serverProtocol = this._ws.protocol ? this._ws.protocol.split('.')[2] : '';

      if (this._options.authid) {
        options.authmethods = this._options.authmethods;
        options.authid = this._options.authid;
      }

      this._log('[wampy] websocket connected');

      if (this._options.serializer.protocol !== serverProtocol) {
        // Server have chosen not our preferred protocol
        // Falling back to json if possible
        //FIXME Temp hack for React Native Environment.
        // Due to bug (facebook/react-native#24796), it doesn't provide selected subprotocol.
        // Remove when ^^^ bug will be fixed.
        if (serverProtocol === 'json' || typeof navigator != 'undefined' && navigator.product === 'ReactNative' && typeof this._ws.protocol === 'undefined') {
          this._options.serializer = new _JsonSerializer.JsonSerializer();
        } else {
          this._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_SERIALIZER_AVAILABLE;
          return this;
        }
      }

      if (this._options.serializer.isBinary) {
        this._ws.binaryType = 'arraybuffer';
      } // WAMP SPEC: [HELLO, Realm|uri, Details|dict]
      // Sending directly 'cause it's a hello msg and no sessionId check is needed


      this._ws.send(this._encode([_constants.WAMP_MSG_SPEC.HELLO, this._options.realm, options]));
    }
    /**
     * Internal websocket on close callback
     * @param {object} event
     * @private
     */

  }, {
    key: "_wsOnClose",
    value: function _wsOnClose(event) {
      var _this2 = this;

      this._log('[wampy] websocket disconnected. Info: ', event); // Automatic reconnection


      if ((this._cache.sessionId || this._cache.reconnectingAttempts) && this._options.autoReconnect && this._cache.reconnectingAttempts < this._options.maxRetries && !this._cache.isSayingGoodbye) {
        this._cache.sessionId = null;
        this._cache.timer = setTimeout(function () {
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
    /**
     * Internal websocket on event callback
     * @param {object} event
     * @private
     */

  }, {
    key: "_wsOnMessage",
    value: function _wsOnMessage(event) {
      var _this3 = this;

      this._decode(event.data).then(function (data) {
        _this3._log('[wampy] websocket message received: ', data);

        var id,
            i,
            p,
            self = _this3;

        switch (data[0]) {
          case _constants.WAMP_MSG_SPEC.WELCOME:
            // WAMP SPEC: [WELCOME, Session|id, Details|dict]
            if (_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received WELCOME message after session was established');
            } else {
              _this3._cache.sessionId = data[1];
              _this3._cache.server_wamp_features = data[2];

              if (_this3._cache.reconnectingAttempts) {
                // There was reconnection
                _this3._cache.reconnectingAttempts = 0;

                if (_this3._options.onReconnectSuccess) {
                  _this3._options.onReconnectSuccess(data[2]);
                } // Let's renew all previous state


                _this3._renewSubscriptions();

                _this3._renewRegistrations();
              } else {
                // Firing onConnect event on real connection to WAMP server
                if (_this3._options.onConnect) {
                  _this3._options.onConnect(data[2]);
                }
              } // Send local queue if there is something out there


              _this3._send();
            }

            break;

          case _constants.WAMP_MSG_SPEC.ABORT:
            // WAMP SPEC: [ABORT, Details|dict, Reason|uri]
            if (_this3._options.onError) {
              _this3._options.onError({
                error: data[2],
                details: data[1]
              });
            }

            _this3._ws.close();

            break;

          case _constants.WAMP_MSG_SPEC.CHALLENGE:
            // WAMP SPEC: [CHALLENGE, AuthMethod|string, Extra|dict]
            if (_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received CHALLENGE message after session was established');
            } else {
              if (_this3._options.authid && typeof _this3._options.onChallenge === 'function') {
                p = new Promise(function (resolve, reject) {
                  resolve(_this3._options.onChallenge(data[1], data[2]));
                });
                p.then(function (key) {
                  // Sending directly 'cause it's a challenge msg and no sessionId check is needed
                  _this3._ws.send(_this3._encode([_constants.WAMP_MSG_SPEC.AUTHENTICATE, key, {}]));
                })["catch"](function (e) {
                  _this3._ws.send(_this3._encode([_constants.WAMP_MSG_SPEC.ABORT, {
                    message: 'Exception in onChallenge handler raised!'
                  }, 'wamp.error.cannot_authenticate']));

                  if (_this3._options.onError) {
                    _this3._options.onError({
                      error: _constants.WAMP_ERROR_MSG.CRA_EXCEPTION.description
                    });
                  }

                  _this3._ws.close();

                  _this3._cache.opStatus = _constants.WAMP_ERROR_MSG.CRA_EXCEPTION;
                });
              } else {
                _this3._ws.send(_this3._encode([_constants.WAMP_MSG_SPEC.ABORT, {
                  message: _constants.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID.description
                }, 'wamp.error.cannot_authenticate']));

                if (_this3._options.onError) {
                  _this3._options.onError({
                    error: _constants.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID.description
                  });
                }

                _this3._ws.close();

                _this3._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID;
              }
            }

            break;

          case _constants.WAMP_MSG_SPEC.GOODBYE:
            // WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received GOODBYE message before session was established');
            } else {
              if (!_this3._cache.isSayingGoodbye) {
                // get goodbye, initiated by server
                _this3._cache.isSayingGoodbye = true;

                _this3._send([_constants.WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.goodbye_and_out']);
              }

              _this3._cache.sessionId = null;

              _this3._ws.close();
            }

            break;

          case _constants.WAMP_MSG_SPEC.ERROR:
            // WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict,
            //             Error|uri, (Arguments|list, ArgumentsKw|dict)]
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received ERROR message before session was established');
            } else {
              switch (data[1]) {
                case _constants.WAMP_MSG_SPEC.SUBSCRIBE:
                case _constants.WAMP_MSG_SPEC.UNSUBSCRIBE:
                case _constants.WAMP_MSG_SPEC.PUBLISH:
                case _constants.WAMP_MSG_SPEC.REGISTER:
                case _constants.WAMP_MSG_SPEC.UNREGISTER:
                  _this3._requests[data[2]] && _this3._requests[data[2]].callbacks.onError && _this3._requests[data[2]].callbacks.onError({
                    error: data[4],
                    details: data[3],
                    argsList: data[5],
                    argsDict: data[6]
                  });
                  delete _this3._requests[data[2]];
                  break;
                // case WAMP_MSG_SPEC.INVOCATION:
                //     break;

                case _constants.WAMP_MSG_SPEC.CALL:
                  // WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict,
                  //             Error|uri, Arguments|list, ArgumentsKw|dict]
                  _this3._calls[data[2]] && _this3._calls[data[2]].onError && _this3._calls[data[2]].onError({
                    error: data[4],
                    details: data[3],
                    argsList: data[5],
                    argsDict: data[6]
                  });
                  delete _this3._calls[data[2]];
                  break;

                default:
                  _this3._hardClose('wamp.error.protocol_violation', 'Received invalid ERROR message');

                  break;
              }
            }

            break;

          case _constants.WAMP_MSG_SPEC.SUBSCRIBED:
            // WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received SUBSCRIBED message before session was established');
            } else {
              if (_this3._requests[data[1]]) {
                _this3._subscriptions[_this3._requests[data[1]].topic] = _this3._subscriptions[data[2]] = {
                  id: data[2],
                  callbacks: [_this3._requests[data[1]].callbacks.onEvent],
                  advancedOptions: _this3._requests[data[1]].advancedOptions
                };

                _this3._subsTopics.add(_this3._requests[data[1]].topic);

                if (_this3._requests[data[1]].callbacks.onSuccess) {
                  _this3._requests[data[1]].callbacks.onSuccess();
                }

                delete _this3._requests[data[1]];
              }
            }

            break;

          case _constants.WAMP_MSG_SPEC.UNSUBSCRIBED:
            // WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received UNSUBSCRIBED message before session was established');
            } else {
              if (_this3._requests[data[1]]) {
                id = _this3._subscriptions[_this3._requests[data[1]].topic].id;
                delete _this3._subscriptions[_this3._requests[data[1]].topic];
                delete _this3._subscriptions[id];

                if (_this3._subsTopics.has(_this3._requests[data[1]].topic)) {
                  _this3._subsTopics["delete"](_this3._requests[data[1]].topic);
                }

                if (_this3._requests[data[1]].callbacks.onSuccess) {
                  _this3._requests[data[1]].callbacks.onSuccess();
                }

                delete _this3._requests[data[1]];
              }
            }

            break;

          case _constants.WAMP_MSG_SPEC.PUBLISHED:
            // WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received PUBLISHED message before session was established');
            } else {
              if (_this3._requests[data[1]]) {
                if (_this3._requests[data[1]].callbacks && _this3._requests[data[1]].callbacks.onSuccess) {
                  _this3._requests[data[1]].callbacks.onSuccess();
                }

                delete _this3._requests[data[1]];
              }
            }

            break;

          case _constants.WAMP_MSG_SPEC.EVENT:
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received EVENT message before session was established');
            } else {
              if (_this3._subscriptions[data[1]]) {
                // WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id,
                //             Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]
                i = _this3._subscriptions[data[1]].callbacks.length;

                while (i--) {
                  _this3._subscriptions[data[1]].callbacks[i]({
                    details: data[3],
                    argsList: data[4],
                    argsDict: data[5]
                  });
                }
              }
            }

            break;

          case _constants.WAMP_MSG_SPEC.RESULT:
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received RESULT message before session was established');
            } else {
              if (_this3._calls[data[1]]) {
                // WAMP SPEC: [RESULT, CALL.Request|id, Details|dict,
                //             YIELD.Arguments|list, YIELD.ArgumentsKw|dict]
                _this3._calls[data[1]].onSuccess({
                  details: data[2],
                  argsList: data[3],
                  argsDict: data[4]
                });

                if (!(data[2].progress && data[2].progress === true)) {
                  // We receive final result (progressive or not)
                  delete _this3._calls[data[1]];
                }
              }
            }

            break;
          // case WAMP_MSG_SPEC.REGISTER:
          //     // WAMP SPEC:
          //     break;

          case _constants.WAMP_MSG_SPEC.REGISTERED:
            // WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received REGISTERED message before session was established');
            } else {
              if (_this3._requests[data[1]]) {
                _this3._rpcRegs[_this3._requests[data[1]].topic] = _this3._rpcRegs[data[2]] = {
                  id: data[2],
                  callbacks: [_this3._requests[data[1]].callbacks.rpc]
                };

                _this3._rpcNames.add(_this3._requests[data[1]].topic);

                if (_this3._requests[data[1]].callbacks && _this3._requests[data[1]].callbacks.onSuccess) {
                  _this3._requests[data[1]].callbacks.onSuccess();
                }

                delete _this3._requests[data[1]];
              }
            }

            break;
          // case WAMP_MSG_SPEC.UNREGISTER:
          //     // WAMP SPEC:
          //     break;

          case _constants.WAMP_MSG_SPEC.UNREGISTERED:
            // WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received UNREGISTERED message before session was established');
            } else {
              if (_this3._requests[data[1]]) {
                id = _this3._rpcRegs[_this3._requests[data[1]].topic].id;
                delete _this3._rpcRegs[_this3._requests[data[1]].topic];
                delete _this3._rpcRegs[id];

                if (_this3._rpcNames.has(_this3._requests[data[1]].topic)) {
                  _this3._rpcNames["delete"](_this3._requests[data[1]].topic);
                }

                if (_this3._requests[data[1]].callbacks && _this3._requests[data[1]].callbacks.onSuccess) {
                  _this3._requests[data[1]].callbacks.onSuccess();
                }

                delete _this3._requests[data[1]];
              }
            }

            break;

          case _constants.WAMP_MSG_SPEC.INVOCATION:
            if (!_this3._cache.sessionId) {
              _this3._hardClose('wamp.error.protocol_violation', 'Received INVOCATION message before session was established');
            } else {
              if (_this3._rpcRegs[data[2]]) {
                // WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id,
                //             Details|dict, CALL.Arguments|list, CALL.ArgumentsKw|dict]
                var invoke_result_handler = function invoke_result_handler(results) {
                  // WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, (Arguments|list,
                  // ArgumentsKw|dict)]
                  var msg = [_constants.WAMP_MSG_SPEC.YIELD, data[1], {}];

                  if (self._isPlainObject(results)) {
                    if (self._isPlainObject(results.options)) {
                      msg[2] = results.options;
                    }

                    if (self._isArray(results.argsList)) {
                      msg.push(results.argsList);
                    } else if (typeof results.argsList !== 'undefined') {
                      msg.push([results.argsList]);
                    }

                    if (self._isPlainObject(results.argsDict)) {
                      if (msg.length === 3) {
                        msg.push([]);
                      }

                      msg.push(results.argsDict);
                    }
                  } else {
                    msg = [_constants.WAMP_MSG_SPEC.YIELD, data[1], {}];
                  }

                  self._send(msg);
                },
                    invoke_error_handler = function invoke_error_handler(_ref) {
                  var details = _ref.details,
                      error = _ref.error,
                      argsList = _ref.argsList,
                      argsDict = _ref.argsDict;
                  var msg = [_constants.WAMP_MSG_SPEC.ERROR, _constants.WAMP_MSG_SPEC.INVOCATION, data[1], details || {}, error || 'wamp.error.invocation_exception'];

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
                };

                p = new Promise(function (resolve, reject) {
                  resolve(_this3._rpcRegs[data[2]].callbacks[0]({
                    details: data[3],
                    argsList: data[4],
                    argsDict: data[5],
                    result_handler: invoke_result_handler,
                    error_handler: invoke_error_handler
                  }));
                });
                p.then(function (results) {
                  invoke_result_handler(results);
                })["catch"](function (e) {
                  invoke_error_handler(e);
                });
              } else {
                // WAMP SPEC: [ERROR, INVOCATION, INVOCATION.Request|id, Details|dict, Error|uri]
                _this3._send([_constants.WAMP_MSG_SPEC.ERROR, _constants.WAMP_MSG_SPEC.INVOCATION, data[1], {}, 'wamp.error.no_such_procedure']);

                _this3._cache.opStatus = _constants.WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION;
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
            _this3._hardClose('wamp.error.protocol_violation', 'Received non-compliant WAMP message');

            break;
        }
      }, function (err) {
        _this3._hardClose('wamp.error.protocol_violation', 'Can not decode received message');
      });
    }
    /**
     * Internal websocket on error callback
     * @param {object} error
     * @private
     */

  }, {
    key: "_wsOnError",
    value: function _wsOnError(error) {
      this._log('[wampy] websocket error');

      if (this._options.onError) {
        this._options.onError({
          error: error
        });
      }
    }
    /**
     * Reconnect to server in case of websocket error
     * @private
     */

  }, {
    key: "_wsReconnect",
    value: function _wsReconnect() {
      this._log('[wampy] websocket reconnecting...');

      if (this._options.onReconnect) {
        this._options.onReconnect();
      }

      this._cache.reconnectingAttempts++;
      this._ws = (0, _utils.getWebSocket)(this._url, this._protocols, this._options.ws, this._options.additionalHeaders, this._options.wsRequestOptions);

      this._initWsCallbacks();
    }
    /**
     * Resubscribe to topics in case of communication error
     * @private
     */

  }, {
    key: "_renewSubscriptions",
    value: function _renewSubscriptions() {
      var i;
      var subs = this._subscriptions,
          st = this._subsTopics;
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
            this.subscribe(topic, subs[topic].callbacks[i], subs[topic].advancedOptions);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
    /**
     * Reregister RPCs in case of communication error
     * @private
     */

  }, {
    key: "_renewRegistrations",
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
          this.register(rpcName, {
            rpc: rpcs[rpcName].callbacks[0]
          });
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
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
     * @param {object} [opts]
     * @returns {*}
     */

  }, {
    key: "options",
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
     * @returns {object} with 2 fields: code, description
     *      code: 0 - if operation was successful
     *      code > 0 - if error occurred
     *      description contains details about error
     *      reqId: last send request ID
     */

  }, {
    key: "getOpStatus",
    value: function getOpStatus() {
      return this._cache.opStatus;
    }
    /**
     * Get the WAMP Session ID
     *
     * @returns {string} Session ID
     */

  }, {
    key: "getSessionId",
    value: function getSessionId() {
      return this._cache.sessionId;
    }
    /**
     * Connect to server
     * @param {string} [url] New url (optional)
     * @returns {Wampy}
     */

  }, {
    key: "connect",
    value: function connect(url) {
      if (url) {
        this._url = url;
      }

      if (this._options.realm) {
        var authp = (this._options.authid ? 1 : 0) + (this._isArray(this._options.authmethods) && this._options.authmethods.length ? 1 : 0) + (typeof this._options.onChallenge === 'function' ? 1 : 0);

        if (authp > 0 && authp < 3) {
          this._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID;
          return this;
        }

        this._setWsProtocols();

        this._ws = (0, _utils.getWebSocket)(this._url, this._protocols, this._options.ws, this._options.additionalHeaders, this._options.wsRequestOptions);

        if (!this._ws) {
          this._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_WS_OR_URL;
          return this;
        }

        this._initWsCallbacks();
      } else {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_REALM;
      }

      return this;
    }
    /**
     * Disconnect from server
     * @returns {Wampy}
     */

  }, {
    key: "disconnect",
    value: function disconnect() {
      if (this._cache.sessionId) {
        // need to send goodbye message to server
        this._cache.isSayingGoodbye = true;

        this._send([_constants.WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.system_shutdown']);
      } else if (this._ws) {
        this._ws.close();
      }

      this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
      return this;
    }
    /**
     * Abort WAMP session establishment
     *
     * @returns {Wampy}
     */

  }, {
    key: "abort",
    value: function abort() {
      if (!this._cache.sessionId && this._ws.readyState === 1) {
        this._send([_constants.WAMP_MSG_SPEC.ABORT, {}, 'wamp.error.abort']);

        this._cache.sessionId = null;
      }

      this._ws.close();

      this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
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
     * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
     *                          { match: string matching policy ("prefix"|"wildcard") }
     *
     * @returns {Wampy}
     */

  }, {
    key: "subscribe",
    value: function subscribe(topicURI, callbacks, advancedOptions) {
      var reqId,
          patternBased = false;
      var options = {};

      if (typeof advancedOptions !== 'undefined' && this._isPlainObject(advancedOptions) && advancedOptions.hasOwnProperty('match')) {
        if (/prefix|wildcard/.test(advancedOptions.match)) {
          options.match = advancedOptions.match;
          patternBased = true;
        }
      }

      if (!this._preReqChecks({
        topic: topicURI,
        patternBased: patternBased,
        allowWAMP: true
      }, 'broker', callbacks)) {
        return this;
      }

      if (typeof callbacks === 'function') {
        callbacks = {
          onEvent: callbacks
        };
      } else if (!this._isPlainObject(callbacks) || typeof callbacks.onEvent === 'undefined') {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

        if (this._isPlainObject(callbacks) && callbacks.onError) {
          callbacks.onError({
            error: this._cache.opStatus.description
          });
        }

        return this;
      }

      if (!this._subscriptions[topicURI] || !this._subscriptions[topicURI].callbacks.length) {
        // no such subscription or processing unsubscribing
        reqId = this._getReqId();
        this._requests[reqId] = {
          topic: topicURI,
          callbacks: callbacks,
          advancedOptions: advancedOptions
        }; // WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]

        this._send([_constants.WAMP_MSG_SPEC.SUBSCRIBE, reqId, options, topicURI]);
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

      this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
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
    key: "unsubscribe",
    value: function unsubscribe(topicURI, callbacks) {
      var reqId,
          i = -1;

      if (!this._preReqChecks(null, 'broker', callbacks)) {
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
          this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
          return this;
        }

        this._requests[reqId] = {
          topic: topicURI,
          callbacks: callbacks
        }; // WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]

        this._send([_constants.WAMP_MSG_SPEC.UNSUBSCRIBE, reqId, this._subscriptions[topicURI].id]);
      } else {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE;

        if (this._isPlainObject(callbacks) && callbacks.onError) {
          callbacks.onError({
            error: this._cache.opStatus.description
          });
        }

        return this;
      }

      this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
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
    key: "publish",
    value: function publish(topicURI, payload, callbacks, advancedOptions) {
      var _this4 = this;

      var reqId,
          msg,
          err = false,
          hasPayload = false;

      var options = {},
          _optionsConvertHelper = function _optionsConvertHelper(option, sourceType) {
        if (advancedOptions[option]) {
          if (_this4._isArray(advancedOptions[option]) && advancedOptions[option].length) {
            options[option] = advancedOptions[option];
          } else if (_typeof(advancedOptions[option]) === sourceType) {
            options[option] = [advancedOptions[option]];
          } else {
            err = true;
          }
        }
      };

      if (!this._preReqChecks({
        topic: topicURI,
        patternBased: false,
        allowWAMP: false
      }, 'broker', callbacks)) {
        return this;
      }

      if (this._isPlainObject(callbacks)) {
        options.acknowledge = true;
      }

      if (typeof advancedOptions !== 'undefined') {
        if (this._isPlainObject(advancedOptions)) {
          _optionsConvertHelper('exclude', 'number');

          _optionsConvertHelper('exclude_authid', 'string');

          _optionsConvertHelper('exclude_authrole', 'string');

          _optionsConvertHelper('eligible', 'number');

          _optionsConvertHelper('eligible_authid', 'string');

          _optionsConvertHelper('eligible_authrole', 'string');

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
          this._cache.opStatus = _constants.WAMP_ERROR_MSG.INVALID_PARAM;

          if (this._isPlainObject(callbacks) && callbacks.onError) {
            callbacks.onError({
              error: this._cache.opStatus.description
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
            callbacks: callbacks
          };
          hasPayload = true;
          break;
      } // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri]


      msg = [_constants.WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI];

      if (hasPayload) {
        // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
        if (this._isArray(payload)) {
          msg.push(payload);
        } else if (this._isPlainObject(payload)) {
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
          } else {
            msg.push([], payload);
          }
        } else {
          // assume it's a single value
          msg.push([payload]);
        }
      }

      this._send(msg);

      this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
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
     * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
     *                          { disclose_me: bool flag of disclosure of Caller identity (WAMP session ID)
     *                                  to endpoints of a routed call
     *                            receive_progress: bool flag for receiving progressive results. In this case
     *                                  onSuccess function will be called every time on receiving result
     *                            timeout: integer timeout (in ms) for the call to finish }
     * @returns {Wampy}
     */

  }, {
    key: "call",
    value: function call(topicURI, payload, callbacks, advancedOptions) {
      var reqId,
          msg,
          err = false;
      var options = {};

      if (!this._preReqChecks({
        topic: topicURI,
        patternBased: false,
        allowWAMP: true
      }, 'dealer', callbacks)) {
        return this;
      }

      if (typeof callbacks === 'function') {
        callbacks = {
          onSuccess: callbacks
        };
      } else if (!this._isPlainObject(callbacks) || typeof callbacks.onSuccess === 'undefined') {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

        if (this._isPlainObject(callbacks) && callbacks.onError) {
          callbacks.onError({
            error: this._cache.opStatus.description
          });
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
          this._cache.opStatus = _constants.WAMP_ERROR_MSG.INVALID_PARAM;

          if (this._isPlainObject(callbacks) && callbacks.onError) {
            callbacks.onError({
              error: this._cache.opStatus.description
            });
          }

          return this;
        }
      }

      do {
        reqId = this._getReqId();
      } while (reqId in this._calls);

      this._calls[reqId] = callbacks; // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]

      msg = [_constants.WAMP_MSG_SPEC.CALL, reqId, options, topicURI];

      if (payload !== null && typeof payload !== 'undefined') {
        if (this._isArray(payload)) {
          msg.push(payload);
        } else if (this._isPlainObject(payload)) {
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
          } else {
            msg.push([], payload);
          }
        } else {
          // assume it's a single value
          msg.push([payload]);
        }
      }

      this._send(msg);

      this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
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
    key: "cancel",
    value: function cancel(reqId, callbacks, advancedOptions) {
      var err = false;
      var options = {};

      if (!this._preReqChecks(null, 'dealer', callbacks)) {
        return this;
      }

      if (!reqId || !this._calls[reqId]) {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID;

        if (this._isPlainObject(callbacks) && callbacks.onError) {
          callbacks.onError({
            error: this._cache.opStatus.description
          });
        }

        return this;
      }

      if (typeof advancedOptions !== 'undefined') {
        if (this._isPlainObject(advancedOptions)) {
          if (advancedOptions.hasOwnProperty('mode')) {
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
          this._cache.opStatus = _constants.WAMP_ERROR_MSG.INVALID_PARAM;

          if (this._isPlainObject(callbacks) && callbacks.onError) {
            callbacks.onError({
              error: this._cache.opStatus.description
            });
          }

          return this;
        }
      } // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]


      this._send([_constants.WAMP_MSG_SPEC.CANCEL, reqId, options]);

      this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
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
     * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
     *                          {
     *                              match: string matching policy ("prefix"|"wildcard")
     *                              invoke: string invocation policy ("single"|"roundrobin"|"random"|"first"|"last")
     *                          }
     * @returns {Wampy}
     */

  }, {
    key: "register",
    value: function register(topicURI, callbacks, advancedOptions) {
      var reqId,
          patternBased = false,
          err = false;
      var options = {};

      if (typeof advancedOptions !== 'undefined') {
        if (this._isPlainObject(advancedOptions)) {
          if (advancedOptions.hasOwnProperty('match')) {
            if (/prefix|wildcard/.test(advancedOptions.match)) {
              options.match = advancedOptions.match;
              patternBased = true;
            } else {
              err = true;
            }
          }

          if (advancedOptions.hasOwnProperty('invoke')) {
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
          this._cache.opStatus = _constants.WAMP_ERROR_MSG.INVALID_PARAM;

          if (this._isPlainObject(callbacks) && callbacks.onError) {
            callbacks.onError({
              error: this._cache.opStatus.description
            });
          }

          return this;
        }
      }

      if (!this._preReqChecks({
        topic: topicURI,
        patternBased: patternBased,
        allowWAMP: false
      }, 'dealer', callbacks)) {
        return this;
      }

      if (typeof callbacks === 'function') {
        callbacks = {
          rpc: callbacks
        };
      } else if (!this._isPlainObject(callbacks) || typeof callbacks.rpc === 'undefined') {
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

        if (this._isPlainObject(callbacks) && callbacks.onError) {
          callbacks.onError({
            error: this._cache.opStatus.description
          });
        }

        return this;
      }

      if (!this._rpcRegs[topicURI] || !this._rpcRegs[topicURI].callbacks.length) {
        // no such registration or processing unregistering
        reqId = this._getReqId();
        this._requests[reqId] = {
          topic: topicURI,
          callbacks: callbacks
        }; // WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]

        this._send([_constants.WAMP_MSG_SPEC.REGISTER, reqId, options, topicURI]);

        this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
      } else {
        // already have registration with such topicURI
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED;

        if (this._isPlainObject(callbacks) && callbacks.onError) {
          callbacks.onError({
            error: this._cache.opStatus.description
          });
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
    key: "unregister",
    value: function unregister(topicURI, callbacks) {
      var reqId;

      if (!this._preReqChecks({
        topic: topicURI,
        patternBased: false,
        allowWAMP: false
      }, 'dealer', callbacks)) {
        return this;
      }

      if (typeof callbacks === 'function') {
        callbacks = {
          onSuccess: callbacks
        };
      }

      if (this._rpcRegs[topicURI]) {
        // there is such registration
        reqId = this._getReqId();
        this._requests[reqId] = {
          topic: topicURI,
          callbacks: callbacks
        }; // WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]

        this._send([_constants.WAMP_MSG_SPEC.UNREGISTER, reqId, this._rpcRegs[topicURI].id]);

        this._cache.opStatus = _constants.WAMP_ERROR_MSG.SUCCESS;
        this._cache.opStatus.reqId = reqId;
      } else {
        // there is no registration with such topicURI
        this._cache.opStatus = _constants.WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG;

        if (this._isPlainObject(callbacks) && callbacks.onError) {
          callbacks.onError({
            error: this._cache.opStatus.description
          });
        }
      }

      return this;
    }
  }]);

  return Wampy;
}();

exports.Wampy = Wampy;
var _default = Wampy;
exports["default"] = _default;
//# sourceMappingURL=wampy.js.map
