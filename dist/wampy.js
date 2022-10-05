"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.Wampy = exports.Errors = void 0;

var _constants = require("./constants.js");

var Errors = _interopRequireWildcard(require("./errors.js"));

exports.Errors = Errors;

var _utils = require("./utils.js");

var _JsonSerializer = require("./serializers/JsonSerializer.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var jsonSerializer = new _JsonSerializer.JsonSerializer();
/**
 * WAMP Client Class
 */

var Wampy = /*#__PURE__*/function () {
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
    this.version = 'v7.0.0';
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
            publisher_identification: true,
            payload_passthru_mode: true
          }
        },
        subscriber: {
          features: {
            pattern_based_subscription: true,
            publication_trustlevels: true,
            publisher_identification: true,
            payload_passthru_mode: true
          }
        },
        caller: {
          features: {
            caller_identification: true,
            progressive_call_results: true,
            call_canceling: true,
            call_timeout: true,
            payload_passthru_mode: true
          }
        },
        callee: {
          features: {
            caller_identification: true,
            call_trustlevels: true,
            pattern_based_registration: true,
            shared_registration: true,
            payload_passthru_mode: true
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


  _createClass(Wampy, [{
    key: "_log",
    value: function _log() {
      if (this._options.debug) {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

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
      } // If obj has modified constructor


      var ctor = obj.constructor;

      if (typeof ctor !== 'function') {
        return false;
      } // If obj has modified prototype


      var prot = ctor.prototype;

      if (this._isObject(prot) === false) {
        return false;
      } // If constructor does not have an Object-specific method


      return Object.hasOwnProperty.call(prot, 'isPrototypeOf') !== false;
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
     * Set websocket protocol based on options
     * @private
     */

  }, {
    key: "_setWsProtocols",
    value: function _setWsProtocols() {
      this._protocols = ['wamp.2.' + this._options.serializer.protocol];
    }
    /**
     * Fill instance operation status
     * @param {Error} err
     * @private
     */

  }, {
    key: "_fillOpStatusByError",
    value: function _fillOpStatusByError(err) {
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

  }, {
    key: "_preReqChecks",
    value: function _preReqChecks(topicType, role) {
      var err;

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

  }, {
    key: "_checkRouterFeature",
    value: function _checkRouterFeature(role, feature) {
      return this._cache.server_wamp_features.roles[role].features[feature] === true;
    }
    /**
     * Check for PPT mode options correctness
     * @param {string} role WAMP Router Role to check support
     * @param {object} options
     * @returns {boolean}
     * @private
     */

  }, {
    key: "_checkPPTOptions",
    value: function _checkPPTOptions(role, options) {
      if (!this._checkRouterFeature(role, 'payload_passthru_mode')) {
        this._fillOpStatusByError(new Errors.PPTNotSupportedError());

        return false;
      }

      if (options.ppt_scheme.search(/^(wamp$|mqtt$|x_)/) < 0) {
        this._fillOpStatusByError(new Errors.PPTInvalidSchemeError());

        return false;
      }

      if (options.ppt_scheme === 'wamp' && !_constants.E2EE_SERIALIZERS.includes(options.ppt_serializer)) {
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
     * Prepares PPT/E2EE payload for adding to WAMP message
     * @param {string|number|Array|object} payload
     * @param {Object} options
     * @returns {Object}
     * @private
     */

  }, {
    key: "_packPPTPayload",
    value: function _packPPTPayload(payload, options) {
      var payloadItems = [],
          err = false,
          argsList,
          argsDict;

      if (this._isArray(payload)) {
        argsList = payload;
      } else if (this._isPlainObject(payload)) {
        // It's a wampy unified form of payload passing
        if (payload.argsList || payload.argsDict) {
          if (this._isArray(payload.argsList)) {
            argsList = payload.argsList;
          } else if (typeof payload.argsList !== 'undefined') {
            argsList = [payload.argsList];
          }

          if (payload.argsDict) {
            argsDict = payload.argsDict;
          }
        } else {
          argsDict = payload;
        }
      } else {
        // assume it's a single value
        argsList = [payload];
      } // Check and handle Payload PassThru Mode
      // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode


      if (options.ppt_scheme) {
        var binPayload,
            pptPayload = {
          args: argsList,
          kwargs: argsDict
        };

        if (options.ppt_serializer && options.ppt_serializer !== 'native') {
          var pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

          if (!pptSerializer) {
            err = true;

            this._fillOpStatusByError(new Errors.PPTSerializerInvalidError());

            return {
              err: err,
              payloadItems: payloadItems
            };
          }

          try {
            binPayload = pptSerializer.encode(pptPayload);
          } catch (e) {
            err = true;

            this._fillOpStatusByError(new Errors.PPTSerializationError());

            return {
              err: err,
              payloadItems: payloadItems
            };
          }
        } else {
          binPayload = pptPayload;
        } // wamp scheme means Payload End-to-End Encryption
        // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti


        if (options.ppt_scheme === 'wamp') {// TODO: implement End-to-End Encryption
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

      return {
        err: err,
        payloadItems: payloadItems
      };
    }
    /**
     * Unpack PPT/E2EE payload to common
     * @param {string} role
     * @param {Array} pptPayload
     * @param {Object} options
     * @returns {Object}
     * @private
     */

  }, {
    key: "_unpackPPTPayload",
    value: function () {
      var _unpackPPTPayload2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(role, pptPayload, options) {
        var err, decodedPayload, pptSerializer;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                err = false;

                if (this._checkPPTOptions(role, options)) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return", {
                  err: this._cache.opStatus.error
                });

              case 3:
                // wamp scheme means Payload End-to-End Encryption
                // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-end-to-end-encrypti
                if (options.ppt_scheme === 'wamp') {// TODO: implement End-to-End Encryption
                }

                if (!(options.ppt_serializer && options.ppt_serializer !== 'native')) {
                  _context.next = 19;
                  break;
                }

                pptSerializer = this._options.payloadSerializers[options.ppt_serializer];

                if (pptSerializer) {
                  _context.next = 8;
                  break;
                }

                return _context.abrupt("return", {
                  err: new Errors.PPTSerializerInvalidError()
                });

              case 8:
                _context.prev = 8;
                _context.next = 11;
                return pptSerializer.decode(pptPayload);

              case 11:
                decodedPayload = _context.sent;
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](8);
                return _context.abrupt("return", {
                  err: new Errors.PPTSerializationError()
                });

              case 17:
                _context.next = 20;
                break;

              case 19:
                decodedPayload = pptPayload;

              case 20:
                return _context.abrupt("return", {
                  err: err,
                  args: decodedPayload.args,
                  kwargs: decodedPayload.kwargs
                });

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 14]]);
      }));

      function _unpackPPTPayload(_x, _x2, _x3) {
        return _unpackPPTPayload2.apply(this, arguments);
      }

      return _unpackPPTPayload;
    }()
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
      this._log(details); // Cleanup outgoing message queue


      this._wsQueue = [];

      this._send([_constants.WAMP_MSG_SPEC.ABORT, {
        message: details
      }, errorUri]); // In case we were just making first connection


      if (this._cache.connectPromise) {
        this._cache.connectPromise.onError(errorUri);

        this._cache.connectPromise = null;
      }

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
     * @param {Array} [msg]
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
        reconnectingAttempts: 0,
        opStatus: _constants.SUCCESS,
        closePromise: null,
        connectPromise: null
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
        options.authextra = this._options.authextra;
      }

      this._log('websocket connected');

      if (this._options.serializer.protocol !== serverProtocol) {
        // Server have chosen not our preferred protocol
        // Falling back to json if possible
        // Temp hack for React Native Environment is removed as
        // (facebook/react-native#24796) was resolved
        if (serverProtocol === 'json') {
          this._options.serializer = new _JsonSerializer.JsonSerializer();
        } else {
          this._fillOpStatusByError(new Errors.NoSerializerAvailableError());

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

      this._log('websocket disconnected. Info: ', event); // Automatic reconnection


      if ((this._cache.sessionId || this._cache.reconnectingAttempts) && this._options.autoReconnect && (this._options.maxRetries === 0 || this._cache.reconnectingAttempts < this._options.maxRetries) && !this._cache.isSayingGoodbye) {
        this._cache.sessionId = null;
        this._cache.timer = setTimeout(function () {
          _this2._wsReconnect();
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

  }, {
    key: "_wsOnMessage",
    value: function () {
      var _wsOnMessage2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(event) {
        var _this3 = this;

        var data, id, i, p, self, error, argsList, argsDict, options, decodedPayload, pptPayload, _argsList, _argsDict, _options, _decodedPayload, _pptPayload, _argsList2, _argsDict2, _options2, invoke_error_handler, invoke_result_handler, _decodedPayload2, _pptPayload2;

        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return this._decode(event.data);

              case 3:
                data = _context2.sent;
                _context2.next = 9;
                break;

              case 6:
                _context2.prev = 6;
                _context2.t0 = _context2["catch"](0);

                this._hardClose('wamp.error.protocol_violation', 'Can not decode received message');

              case 9:
                this._log('websocket message received: ', data);

                self = this;
                _context2.t1 = data[0];
                _context2.next = _context2.t1 === _constants.WAMP_MSG_SPEC.WELCOME ? 14 : _context2.t1 === _constants.WAMP_MSG_SPEC.ABORT ? 16 : _context2.t1 === _constants.WAMP_MSG_SPEC.CHALLENGE ? 19 : _context2.t1 === _constants.WAMP_MSG_SPEC.GOODBYE ? 40 : _context2.t1 === _constants.WAMP_MSG_SPEC.ERROR ? 42 : _context2.t1 === _constants.WAMP_MSG_SPEC.SUBSCRIBED ? 58 : _context2.t1 === _constants.WAMP_MSG_SPEC.UNSUBSCRIBED ? 60 : _context2.t1 === _constants.WAMP_MSG_SPEC.PUBLISHED ? 62 : _context2.t1 === _constants.WAMP_MSG_SPEC.EVENT ? 64 : _context2.t1 === _constants.WAMP_MSG_SPEC.RESULT ? 87 : _context2.t1 === _constants.WAMP_MSG_SPEC.REGISTERED ? 112 : _context2.t1 === _constants.WAMP_MSG_SPEC.UNREGISTERED ? 114 : _context2.t1 === _constants.WAMP_MSG_SPEC.INVOCATION ? 116 : 151;
                break;

              case 14:
                // WAMP SPEC: [WELCOME, Session|id, Details|dict]
                if (this._cache.sessionId) {
                  this._hardClose('wamp.error.protocol_violation', 'Received WELCOME message after session was established');
                } else {
                  this._cache.sessionId = data[1];
                  this._cache.server_wamp_features = data[2];

                  if (this._cache.reconnectingAttempts) {
                    // There was reconnection
                    this._cache.reconnectingAttempts = 0;

                    if (this._options.onReconnectSuccess) {
                      this._options.onReconnectSuccess(data[2]);
                    } // Let's renew all previous state


                    this._renewSubscriptions();

                    this._renewRegistrations();
                  } else {
                    // Firing onConnect event on real connection to WAMP server
                    this._cache.connectPromise.onSuccess(data[2]);

                    this._cache.connectPromise = null;
                  } // Send local queue if there is something out there


                  this._send();
                }

                return _context2.abrupt("break", 153);

              case 16:
                // WAMP SPEC: [ABORT, Details|dict, Reason|uri]
                if (this._options.onError) {
                  this._options.onError({
                    error: data[2],
                    details: data[1]
                  });
                }

                this._ws.close();

                return _context2.abrupt("break", 153);

              case 19:
                if (!this._cache.sessionId) {
                  _context2.next = 24;
                  break;
                }

                this._hardClose('wamp.error.protocol_violation', 'Received CHALLENGE message after session was established');

                return _context2.abrupt("break", 153);

              case 24:
                if (!(this._options.authid && this._options.authMode === 'manual' && typeof this._options.onChallenge === 'function')) {
                  _context2.next = 28;
                  break;
                }

                p = new Promise(function (resolve, reject) {
                  resolve(_this3._options.onChallenge(data[1], data[2]));
                });
                _context2.next = 38;
                break;

              case 28:
                if (!(this._options.authid && this._options.authMode === 'auto' && typeof this._options.authPlugins[data[1]] === 'function')) {
                  _context2.next = 32;
                  break;
                }

                p = new Promise(function (resolve, reject) {
                  resolve(_this3._options.authPlugins[data[1]](data[1], data[2]));
                });
                _context2.next = 38;
                break;

              case 32:
                error = new Errors.NoCRACallbackOrIdError();

                this._ws.send(this._encode([_constants.WAMP_MSG_SPEC.ABORT, {
                  message: error.message
                }, 'wamp.error.cannot_authenticate']));

                if (this._options.onError) {
                  this._options.onError({
                    error: error
                  });
                }

                this._ws.close();

                this._fillOpStatusByError(error);

                return _context2.abrupt("break", 153);

              case 38:
                p.then(function (key) {
                  // Sending directly 'cause it's a challenge msg and no sessionId check is needed
                  _this3._ws.send(_this3._encode([_constants.WAMP_MSG_SPEC.AUTHENTICATE, key, {}]));
                })["catch"](function (e) {
                  var error = new Errors.ChallengeExceptionError();

                  _this3._ws.send(_this3._encode([_constants.WAMP_MSG_SPEC.ABORT, {
                    message: error.message
                  }, 'wamp.error.cannot_authenticate']));

                  if (_this3._options.onError) {
                    _this3._options.onError({
                      error: error
                    });
                  }

                  _this3._ws.close();

                  _this3._fillOpStatusByError(error);
                });
                return _context2.abrupt("break", 153);

              case 40:
                // WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
                if (!this._cache.sessionId) {
                  this._hardClose('wamp.error.protocol_violation', 'Received GOODBYE message before session was established');
                } else {
                  if (!this._cache.isSayingGoodbye) {
                    // get goodbye, initiated by server
                    this._cache.isSayingGoodbye = true;

                    this._send([_constants.WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.goodbye_and_out']);
                  }

                  this._cache.sessionId = null;

                  this._ws.close();
                }

                return _context2.abrupt("break", 153);

              case 42:
                if (this._cache.sessionId) {
                  _context2.next = 46;
                  break;
                }

                this._hardClose('wamp.error.protocol_violation', 'Received ERROR message before session was established');

                _context2.next = 57;
                break;

              case 46:
                _context2.t2 = data[1];
                _context2.next = _context2.t2 === _constants.WAMP_MSG_SPEC.SUBSCRIBE ? 49 : _context2.t2 === _constants.WAMP_MSG_SPEC.UNSUBSCRIBE ? 49 : _context2.t2 === _constants.WAMP_MSG_SPEC.PUBLISH ? 49 : _context2.t2 === _constants.WAMP_MSG_SPEC.REGISTER ? 49 : _context2.t2 === _constants.WAMP_MSG_SPEC.UNREGISTER ? 49 : _context2.t2 === _constants.WAMP_MSG_SPEC.CALL ? 52 : 55;
                break;

              case 49:
                this._requests[data[2]] && this._requests[data[2]].callbacks.onError && this._requests[data[2]].callbacks.onError({
                  error: data[4],
                  details: data[3],
                  argsList: data[5],
                  argsDict: data[6]
                });
                delete this._requests[data[2]];
                return _context2.abrupt("break", 57);

              case 52:
                // WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict,
                //             Error|uri, Arguments|list, ArgumentsKw|dict]
                this._calls[data[2]] && this._calls[data[2]].onError && this._calls[data[2]].onError({
                  error: data[4],
                  details: data[3],
                  argsList: data[5],
                  argsDict: data[6]
                });
                delete this._calls[data[2]];
                return _context2.abrupt("break", 57);

              case 55:
                this._hardClose('wamp.error.protocol_violation', 'Received invalid ERROR message');

                return _context2.abrupt("break", 57);

              case 57:
                return _context2.abrupt("break", 153);

              case 58:
                // WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
                if (!this._cache.sessionId) {
                  this._hardClose('wamp.error.protocol_violation', 'Received SUBSCRIBED message before session was established');
                } else {
                  if (this._requests[data[1]]) {
                    this._subscriptions[this._requests[data[1]].topic] = this._subscriptions[data[2]] = {
                      id: data[2],
                      callbacks: [this._requests[data[1]].callbacks.onEvent],
                      advancedOptions: this._requests[data[1]].advancedOptions
                    };

                    this._subsTopics.add(this._requests[data[1]].topic);

                    if (this._requests[data[1]].callbacks.onSuccess) {
                      this._requests[data[1]].callbacks.onSuccess({
                        topic: this._requests[data[1]].topic,
                        requestId: data[1],
                        subscriptionId: data[2]
                      });
                    }

                    delete this._requests[data[1]];
                  }
                }

                return _context2.abrupt("break", 153);

              case 60:
                // WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
                if (!this._cache.sessionId) {
                  this._hardClose('wamp.error.protocol_violation', 'Received UNSUBSCRIBED message before session was established');
                } else {
                  if (this._requests[data[1]]) {
                    id = this._subscriptions[this._requests[data[1]].topic].id;
                    delete this._subscriptions[this._requests[data[1]].topic];
                    delete this._subscriptions[id];

                    if (this._subsTopics.has(this._requests[data[1]].topic)) {
                      this._subsTopics["delete"](this._requests[data[1]].topic);
                    }

                    if (this._requests[data[1]].callbacks.onSuccess) {
                      this._requests[data[1]].callbacks.onSuccess({
                        topic: this._requests[data[1]].topic,
                        requestId: data[1]
                      });
                    }

                    delete this._requests[data[1]];
                  }
                }

                return _context2.abrupt("break", 153);

              case 62:
                // WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
                if (!this._cache.sessionId) {
                  this._hardClose('wamp.error.protocol_violation', 'Received PUBLISHED message before session was established');
                } else {
                  if (this._requests[data[1]]) {
                    if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                      this._requests[data[1]].callbacks.onSuccess({
                        topic: this._requests[data[1]].topic,
                        requestId: data[1],
                        publicationId: data[2]
                      });
                    }

                    delete this._requests[data[1]];
                  }
                }

                return _context2.abrupt("break", 153);

              case 64:
                if (this._cache.sessionId) {
                  _context2.next = 68;
                  break;
                }

                this._hardClose('wamp.error.protocol_violation', 'Received EVENT message before session was established');

                _context2.next = 86;
                break;

              case 68:
                if (!this._subscriptions[data[1]]) {
                  _context2.next = 86;
                  break;
                }

                options = data[3]; // WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id,
                //             Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]
                // Check and handle Payload PassThru Mode
                // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode

                if (!options.ppt_scheme) {
                  _context2.next = 82;
                  break;
                }

                pptPayload = data[4][0];
                _context2.next = 74;
                return this._unpackPPTPayload('broker', pptPayload, options);

              case 74:
                decodedPayload = _context2.sent;

                if (!decodedPayload.err) {
                  _context2.next = 78;
                  break;
                }

                // Since it is async publication, and no link to
                // original publication - as it was already published
                // we can not reply with error, only log it.
                // Although the router should handle it
                this._log(decodedPayload.err.message);

                return _context2.abrupt("break", 153);

              case 78:
                argsList = decodedPayload.args;
                argsDict = decodedPayload.kwargs;
                _context2.next = 84;
                break;

              case 82:
                argsList = data[4];
                argsDict = data[5];

              case 84:
                i = this._subscriptions[data[1]].callbacks.length;

                while (i--) {
                  this._subscriptions[data[1]].callbacks[i]({
                    details: options,
                    argsList: argsList,
                    argsDict: argsDict
                  });
                }

              case 86:
                return _context2.abrupt("break", 153);

              case 87:
                if (this._cache.sessionId) {
                  _context2.next = 91;
                  break;
                }

                this._hardClose('wamp.error.protocol_violation', 'Received RESULT message before session was established');

                _context2.next = 111;
                break;

              case 91:
                if (!this._calls[data[1]]) {
                  _context2.next = 111;
                  break;
                }

                _options = data[2]; // WAMP SPEC: [RESULT, CALL.Request|id, Details|dict,
                //             YIELD.Arguments|list, YIELD.ArgumentsKw|dict]
                // Check and handle Payload PassThru Mode
                // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode

                if (!_options.ppt_scheme) {
                  _context2.next = 108;
                  break;
                }

                _pptPayload = data[3][0];
                _context2.next = 97;
                return this._unpackPPTPayload('dealer', _pptPayload, _options);

              case 97:
                _decodedPayload = _context2.sent;

                if (!_decodedPayload.err) {
                  _context2.next = 104;
                  break;
                }

                this._log(_decodedPayload.err.message);

                this._cache.opStatus = _decodedPayload.err;

                this._calls[data[1]].onError({
                  error: _decodedPayload.err.message,
                  details: data[2],
                  argsList: data[3],
                  argsDict: data[4]
                });

                delete this._calls[data[1]];
                return _context2.abrupt("break", 153);

              case 104:
                _argsList = _decodedPayload.args;
                _argsDict = _decodedPayload.kwargs;
                _context2.next = 110;
                break;

              case 108:
                _argsList = data[3];
                _argsDict = data[4];

              case 110:
                if (_options.progress === true) {
                  this._calls[data[1]].onProgress({
                    details: _options,
                    argsList: _argsList,
                    argsDict: _argsDict
                  });
                } else {
                  // We received final result (progressive or not)
                  this._calls[data[1]].onSuccess({
                    details: _options,
                    argsList: _argsList,
                    argsDict: _argsDict
                  });

                  delete this._calls[data[1]];
                }

              case 111:
                return _context2.abrupt("break", 153);

              case 112:
                // WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
                if (!this._cache.sessionId) {
                  this._hardClose('wamp.error.protocol_violation', 'Received REGISTERED message before session was established');
                } else {
                  if (this._requests[data[1]]) {
                    this._rpcRegs[this._requests[data[1]].topic] = this._rpcRegs[data[2]] = {
                      id: data[2],
                      callbacks: [this._requests[data[1]].callbacks.rpc]
                    };

                    this._rpcNames.add(this._requests[data[1]].topic);

                    if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                      this._requests[data[1]].callbacks.onSuccess({
                        topic: this._requests[data[1]].topic,
                        requestId: data[1],
                        registrationId: data[2]
                      });
                    }

                    delete this._requests[data[1]];
                  }
                }

                return _context2.abrupt("break", 153);

              case 114:
                // WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
                if (!this._cache.sessionId) {
                  this._hardClose('wamp.error.protocol_violation', 'Received UNREGISTERED message before session was established');
                } else {
                  if (this._requests[data[1]]) {
                    id = this._rpcRegs[this._requests[data[1]].topic].id;
                    delete this._rpcRegs[this._requests[data[1]].topic];
                    delete this._rpcRegs[id];

                    if (this._rpcNames.has(this._requests[data[1]].topic)) {
                      this._rpcNames["delete"](this._requests[data[1]].topic);
                    }

                    if (this._requests[data[1]].callbacks && this._requests[data[1]].callbacks.onSuccess) {
                      this._requests[data[1]].callbacks.onSuccess({
                        topic: this._requests[data[1]].topic,
                        requestId: data[1]
                      });
                    }

                    delete this._requests[data[1]];
                  }
                }

                return _context2.abrupt("break", 153);

              case 116:
                if (this._cache.sessionId) {
                  _context2.next = 120;
                  break;
                }

                this._hardClose('wamp.error.protocol_violation', 'Received INVOCATION message before session was established');

                _context2.next = 150;
                break;

              case 120:
                if (!this._rpcRegs[data[2]]) {
                  _context2.next = 148;
                  break;
                }

                _options2 = data[3]; // WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id,
                //             Details|dict, CALL.Arguments|list, CALL.ArgumentsKw|dict]

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
                }, invoke_result_handler = function invoke_result_handler(results) {
                  // WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, (Arguments|list,
                  // ArgumentsKw|dict)]
                  var msg = [_constants.WAMP_MSG_SPEC.YIELD, data[1], {}];

                  if (self._isPlainObject(results)) {
                    if (self._isPlainObject(results.options)) {
                      var _options3 = results.options; // Check and handle Payload PassThru Mode
                      // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode

                      var pptScheme = results.options.ppt_scheme;

                      if (pptScheme) {
                        if (!_this3._checkPPTOptions('dealer', results.options)) {
                          if (_this3._cache.opStatus.error && _this3._cache.opStatus.error instanceof Errors.PPTNotSupportedError) {
                            // This case should not happen at all, but for safety
                            _this3._hardClose('wamp.error.protocol_violation', 'Trying to send YIELD in PPT Mode, while Dealer didn\'t announce it');
                          } else {
                            invoke_error_handler({
                              details: results.options,
                              error: _this3._cache.opStatus.error.message,
                              argsList: results.argsList,
                              argsDict: results.argsDict
                            });
                          }

                          return;
                        }

                        _options3.ppt_scheme = pptScheme;

                        if (results.options.ppt_serializer) {
                          _options3.ppt_serializer = results.options.ppt_serializer;
                        }

                        if (results.options.ppt_cipher) {
                          _options3.ppt_cipher = results.options.ppt_cipher;
                        }

                        if (results.options.ppt_keyid) {
                          _options3.ppt_keyid = results.options.ppt_keyid;
                        }
                      }

                      msg[2] = _options3;
                    }
                  }

                  if (results !== null && typeof results !== 'undefined') {
                    var res = _this3._packPPTPayload(results, results.options);

                    if (res.err) {
                      var _argsList3, _argsDict3;

                      if (!(_this3._cache.opStatus.error instanceof Errors.PPTSerializationError)) {
                        _argsList3 = results.argsList;
                        _argsDict3 = results.argsDict;
                      }

                      invoke_error_handler({
                        details: results.options,
                        error: _this3._cache.opStatus.error.message,
                        argsList: _argsList3,
                        argsDict: _argsDict3
                      });
                      return;
                    }

                    msg = msg.concat(res.payloadItems);
                  }

                  self._send(msg);
                }; // Check and handle Payload PassThru Mode
                // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode

                if (!_options2.ppt_scheme) {
                  _context2.next = 142;
                  break;
                }

                _pptPayload2 = data[4][0];
                _context2.next = 127;
                return this._unpackPPTPayload('dealer', _pptPayload2, _options2);

              case 127:
                _decodedPayload2 = _context2.sent;

                if (!(_decodedPayload2.err && _decodedPayload2.err instanceof Errors.PPTNotSupportedError)) {
                  _context2.next = 134;
                  break;
                }

                this._log(_decodedPayload2.err.message);

                this._hardClose('wamp.error.protocol_violation', 'Received INVOCATION in PPT Mode, while Dealer didn\'t announce it');

                return _context2.abrupt("break", 153);

              case 134:
                if (!_decodedPayload2.err) {
                  _context2.next = 138;
                  break;
                }

                this._log(_decodedPayload2.err.message);

                invoke_error_handler({
                  details: data[3],
                  error: _decodedPayload2.err.message,
                  argsList: data[4],
                  argsDict: data[5]
                });
                return _context2.abrupt("break", 153);

              case 138:
                _argsList2 = _decodedPayload2.args;
                _argsDict2 = _decodedPayload2.kwargs;
                _context2.next = 144;
                break;

              case 142:
                _argsList2 = data[4];
                _argsDict2 = data[5];

              case 144:
                p = new Promise(function (resolve, reject) {
                  resolve(_this3._rpcRegs[data[2]].callbacks[0]({
                    details: _options2,
                    argsList: _argsList2,
                    argsDict: _argsDict2,
                    result_handler: invoke_result_handler,
                    error_handler: invoke_error_handler
                  }));
                });
                p.then(function (results) {
                  invoke_result_handler(results);
                })["catch"](function (e) {
                  invoke_error_handler(e);
                });
                _context2.next = 150;
                break;

              case 148:
                // WAMP SPEC: [ERROR, INVOCATION, INVOCATION.Request|id, Details|dict, Error|uri]
                this._send([_constants.WAMP_MSG_SPEC.ERROR, _constants.WAMP_MSG_SPEC.INVOCATION, data[1], {}, 'wamp.error.no_such_procedure']);

                this._log(_constants.WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION);

              case 150:
                return _context2.abrupt("break", 153);

              case 151:
                this._hardClose('wamp.error.protocol_violation', 'Received non-compliant WAMP message');

                return _context2.abrupt("break", 153);

              case 153:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 6]]);
      }));

      function _wsOnMessage(_x4) {
        return _wsOnMessage2.apply(this, arguments);
      }

      return _wsOnMessage;
    }()
    /**
     * Internal websocket on error callback
     * @param {object} error
     * @private
     */

  }, {
    key: "_wsOnError",
    value: function _wsOnError(error) {
      this._log('websocket error');

      if (this._cache.connectPromise) {
        this._cache.connectPromise.onError(error);

        this._cache.connectPromise = null;
      }

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
      this._log('websocket reconnecting...');

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

      var _iterator = _createForOfIteratorHelper(st),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var topic = _step.value;
          i = subs[topic].callbacks.length;

          while (i--) {
            this.subscribe(topic, subs[topic].callbacks[i], subs[topic].advancedOptions);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
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

      var _iterator2 = _createForOfIteratorHelper(rn),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var rpcName = _step2.value;
          this.register(rpcName, rpcs[rpcName].callbacks[0]);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
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
     * @returns {object} with 3 fields: code, error, reqId
     *      code: 0 - if operation was successful
     *      code > 0 - if error occurred
     *      error: error instance containing details
     *      reqId: last successfully sent request ID
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
     * @returns {Promise}
     */

  }, {
    key: "connect",
    value: function () {
      var _connect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(url) {
        var error, authOpts, defer;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (url) {
                  this._url = url;
                }

                if (!this._options.realm) {
                  _context3.next = 16;
                  break;
                }

                authOpts = (this._options.authid ? 1 : 0) + (this._isArray(this._options.authmethods) && this._options.authmethods.length ? 1 : 0) + (typeof this._options.onChallenge === 'function' || Object.keys(this._options.authPlugins).length ? 1 : 0);

                if (!(authOpts > 0 && authOpts < 3)) {
                  _context3.next = 7;
                  break;
                }

                error = new Errors.NoCRACallbackOrIdError();

                this._fillOpStatusByError(error);

                throw error;

              case 7:
                this._setWsProtocols();

                this._ws = (0, _utils.getWebSocket)(this._url, this._protocols, this._options.ws, this._options.additionalHeaders, this._options.wsRequestOptions);

                if (this._ws) {
                  _context3.next = 13;
                  break;
                }

                error = new Errors.NoWsOrUrlError();

                this._fillOpStatusByError(error);

                throw error;

              case 13:
                this._initWsCallbacks();

                _context3.next = 19;
                break;

              case 16:
                error = new Errors.NoRealmError();

                this._fillOpStatusByError(error);

                throw error;

              case 19:
                defer = (0, _utils.getNewPromise)();
                this._cache.connectPromise = defer;
                return _context3.abrupt("return", defer.promise);

              case 22:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function connect(_x5) {
        return _connect.apply(this, arguments);
      }

      return connect;
    }()
    /**
     * Disconnect from server
     * @returns {Promise}
     */

  }, {
    key: "disconnect",
    value: function () {
      var _disconnect = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        var defer;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this._cache.sessionId) {
                  _context4.next = 9;
                  break;
                }

                defer = (0, _utils.getNewPromise)();
                this._cache.opStatus = _constants.SUCCESS;
                this._cache.closePromise = defer; // need to send goodbye message to server

                this._cache.isSayingGoodbye = true;

                this._send([_constants.WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.close.system_shutdown']);

                return _context4.abrupt("return", defer.promise);

              case 9:
                if (this._ws) {
                  this._ws.close();
                }

              case 10:
                return _context4.abrupt("return", true);

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function disconnect() {
        return _disconnect.apply(this, arguments);
      }

      return disconnect;
    }()
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

      this._cache.opStatus = _constants.SUCCESS;
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

  }, {
    key: "subscribe",
    value: function () {
      var _subscribe = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(topicURI, onEvent, advancedOptions) {
        var reqId, patternBased, options, callbacks, error, _error, _error2;

        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                patternBased = false;
                options = {}, callbacks = (0, _utils.getNewPromise)();

                if (!this._isPlainObject(advancedOptions)) {
                  _context5.next = 14;
                  break;
                }

                if (!Object.prototype.hasOwnProperty.call(advancedOptions, 'match')) {
                  _context5.next = 12;
                  break;
                }

                if (!/prefix|wildcard/.test(advancedOptions.match)) {
                  _context5.next = 9;
                  break;
                }

                options.match = advancedOptions.match;
                patternBased = true;
                _context5.next = 12;
                break;

              case 9:
                error = new Errors.InvalidParamError();

                this._fillOpStatusByError(error);

                throw error;

              case 12:
                _context5.next = 18;
                break;

              case 14:
                if (!(typeof advancedOptions !== 'undefined')) {
                  _context5.next = 18;
                  break;
                }

                _error = new Errors.InvalidParamError();

                this._fillOpStatusByError(_error);

                throw _error;

              case 18:
                if (this._preReqChecks({
                  topic: topicURI,
                  patternBased: patternBased,
                  allowWAMP: true
                }, 'broker')) {
                  _context5.next = 20;
                  break;
                }

                throw this._cache.opStatus.error;

              case 20:
                if (!(typeof onEvent === 'function')) {
                  _context5.next = 24;
                  break;
                }

                callbacks.onEvent = onEvent;
                _context5.next = 27;
                break;

              case 24:
                _error2 = new Errors.NoCallbackError();

                this._fillOpStatusByError(_error2);

                throw _error2;

              case 27:
                if (!(!this._subscriptions[topicURI] || !this._subscriptions[topicURI].callbacks.length)) {
                  _context5.next = 33;
                  break;
                }

                // no such subscription or processing unsubscribing
                reqId = this._getReqId();
                this._requests[reqId] = {
                  topic: topicURI,
                  callbacks: callbacks,
                  advancedOptions: advancedOptions
                }; // WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]

                this._send([_constants.WAMP_MSG_SPEC.SUBSCRIBE, reqId, options, topicURI]);

                _context5.next = 35;
                break;

              case 33:
                // already have subscription to this topic
                // There is no such callback yet
                if (this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent) < 0) {
                  this._subscriptions[topicURI].callbacks.push(callbacks.onEvent);
                }

                return _context5.abrupt("return", {
                  topic: topicURI,
                  subscriptionId: this._subscriptions[topicURI].id
                });

              case 35:
                this._cache.opStatus = _constants.SUCCESS;
                this._cache.opStatus.reqId = reqId;
                return _context5.abrupt("return", callbacks.promise);

              case 38:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function subscribe(_x6, _x7, _x8) {
        return _subscribe.apply(this, arguments);
      }

      return subscribe;
    }()
    /**
     * Unsubscribe from topic
     * @param {string} topicURI
     * @param {function} [onEvent] - received event callback to remove (optional). If not provided -
     *                               all callbacks will be removed and unsubscribed on the server
     * @returns {Promise}
     */

  }, {
    key: "unsubscribe",
    value: function () {
      var _unsubscribe = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(topicURI, onEvent) {
        var reqId, callbacks, i, error;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                callbacks = (0, _utils.getNewPromise)();

                if (this._preReqChecks(null, 'broker')) {
                  _context6.next = 3;
                  break;
                }

                throw this._cache.opStatus.error;

              case 3:
                if (!this._subscriptions[topicURI]) {
                  _context6.next = 13;
                  break;
                }

                reqId = this._getReqId();

                if (typeof onEvent === 'function') {
                  i = this._subscriptions[topicURI].callbacks.indexOf(onEvent);

                  if (i >= 0) {
                    this._subscriptions[topicURI].callbacks.splice(i, 1);
                  }
                } else {
                  this._subscriptions[topicURI].callbacks = [];
                }

                if (!this._subscriptions[topicURI].callbacks.length) {
                  _context6.next = 9;
                  break;
                }

                // There are another callbacks for this topic
                this._cache.opStatus = _constants.SUCCESS;
                return _context6.abrupt("return", true);

              case 9:
                this._requests[reqId] = {
                  topic: topicURI,
                  callbacks: callbacks
                }; // WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]

                this._send([_constants.WAMP_MSG_SPEC.UNSUBSCRIBE, reqId, this._subscriptions[topicURI].id]);

                _context6.next = 16;
                break;

              case 13:
                error = new Errors.NonExistUnsubscribeError();

                this._fillOpStatusByError(error);

                throw error;

              case 16:
                this._cache.opStatus = _constants.SUCCESS;
                this._cache.opStatus.reqId = reqId;
                return _context6.abrupt("return", callbacks.promise);

              case 19:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function unsubscribe(_x9, _x10) {
        return _unsubscribe.apply(this, arguments);
      }

      return unsubscribe;
    }()
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
     *                                      to receivers of a published event }
     * @returns {Promise}
     */

  }, {
    key: "publish",
    value: function () {
      var _publish = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(topicURI, payload, advancedOptions) {
        var _this4 = this;

        var reqId,
            msg,
            options,
            callbacks,
            _optionsConvertHelper,
            error,
            pptScheme,
            _error3,
            res,
            _args7 = arguments;

        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                options = {
                  acknowledge: true
                }, callbacks = (0, _utils.getNewPromise)(), _optionsConvertHelper = function _optionsConvertHelper(option, sourceType) {
                  if (advancedOptions[option]) {
                    if (_this4._isArray(advancedOptions[option]) && advancedOptions[option].length) {
                      options[option] = advancedOptions[option];
                    } else if (_typeof(advancedOptions[option]) === sourceType) {
                      options[option] = [advancedOptions[option]];
                    } else {
                      return false;
                    }
                  }

                  return true;
                };

                if (this._preReqChecks({
                  topic: topicURI,
                  patternBased: false,
                  allowWAMP: false
                }, 'broker')) {
                  _context7.next = 3;
                  break;
                }

                throw this._cache.opStatus.error;

              case 3:
                if (!this._isPlainObject(advancedOptions)) {
                  _context7.next = 20;
                  break;
                }

                if (!(!_optionsConvertHelper('exclude', 'number') || !_optionsConvertHelper('exclude_authid', 'string') || !_optionsConvertHelper('exclude_authrole', 'string') || !_optionsConvertHelper('eligible', 'number') || !_optionsConvertHelper('eligible_authid', 'string') || !_optionsConvertHelper('eligible_authrole', 'string'))) {
                  _context7.next = 8;
                  break;
                }

                error = new Errors.InvalidParamError();

                this._fillOpStatusByError(error);

                throw error;

              case 8:
                if (Object.hasOwnProperty.call(advancedOptions, 'exclude_me')) {
                  options.exclude_me = advancedOptions.exclude_me !== false;
                }

                if (Object.hasOwnProperty.call(advancedOptions, 'disclose_me')) {
                  options.disclose_me = advancedOptions.disclose_me === true;
                } // Check and handle Payload PassThru Mode
                // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode


                pptScheme = advancedOptions.ppt_scheme;

                if (!pptScheme) {
                  _context7.next = 18;
                  break;
                }

                if (this._checkPPTOptions('broker', advancedOptions)) {
                  _context7.next = 14;
                  break;
                }

                throw this._cache.opStatus.error;

              case 14:
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

              case 18:
                _context7.next = 24;
                break;

              case 20:
                if (!(typeof advancedOptions !== 'undefined')) {
                  _context7.next = 24;
                  break;
                }

                _error3 = new Errors.InvalidParamError();

                this._fillOpStatusByError(_error3);

                throw _error3;

              case 24:
                reqId = this._getReqId();
                this._requests[reqId] = {
                  topic: topicURI,
                  callbacks: callbacks
                }; // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri]

                msg = [_constants.WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI];

                if (!(_args7.length > 1)) {
                  _context7.next = 32;
                  break;
                }

                // WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
                res = this._packPPTPayload(payload, options);

                if (!res.err) {
                  _context7.next = 31;
                  break;
                }

                throw this._cache.opStatus.error;

              case 31:
                msg = msg.concat(res.payloadItems);

              case 32:
                this._send(msg);

                this._cache.opStatus = _constants.SUCCESS;
                this._cache.opStatus.reqId = reqId;
                return _context7.abrupt("return", callbacks.promise);

              case 36:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function publish(_x11, _x12, _x13) {
        return _publish.apply(this, arguments);
      }

      return publish;
    }()
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
     *                          }
     * @returns {Promise}
     */

  }, {
    key: "call",
    value: function () {
      var _call = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(topicURI, payload, advancedOptions) {
        var reqId, msg, options, callbacks, error, _error4, pptScheme, _error5, res;

        return _regeneratorRuntime().wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                options = {}, callbacks = (0, _utils.getNewPromise)();

                if (this._preReqChecks({
                  topic: topicURI,
                  patternBased: false,
                  allowWAMP: true
                }, 'dealer')) {
                  _context8.next = 3;
                  break;
                }

                throw this._cache.opStatus.error;

              case 3:
                if (!this._isPlainObject(advancedOptions)) {
                  _context8.next = 32;
                  break;
                }

                if (Object.hasOwnProperty.call(advancedOptions, 'disclose_me')) {
                  options.disclose_me = advancedOptions.disclose_me === true;
                }

                if (!Object.hasOwnProperty.call(advancedOptions, 'progress_callback')) {
                  _context8.next = 14;
                  break;
                }

                if (!(typeof advancedOptions.progress_callback === 'function')) {
                  _context8.next = 11;
                  break;
                }

                options.receive_progress = true;
                callbacks.onProgress = advancedOptions.progress_callback;
                _context8.next = 14;
                break;

              case 11:
                error = new Errors.InvalidParamError();

                this._fillOpStatusByError(error);

                throw error;

              case 14:
                if (!Object.hasOwnProperty.call(advancedOptions, 'timeout')) {
                  _context8.next = 22;
                  break;
                }

                if (!(typeof advancedOptions.timeout === 'number')) {
                  _context8.next = 19;
                  break;
                }

                options.timeout = advancedOptions.timeout;
                _context8.next = 22;
                break;

              case 19:
                _error4 = new Errors.InvalidParamError();

                this._fillOpStatusByError(_error4);

                throw _error4;

              case 22:
                // Check and handle Payload PassThru Mode
                // @see https://wamp-proto.org/wamp_latest_ietf.html#name-payload-passthru-mode
                pptScheme = advancedOptions.ppt_scheme;

                if (!pptScheme) {
                  _context8.next = 30;
                  break;
                }

                if (this._checkPPTOptions('dealer', advancedOptions)) {
                  _context8.next = 26;
                  break;
                }

                throw this._cache.opStatus.error;

              case 26:
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

              case 30:
                _context8.next = 36;
                break;

              case 32:
                if (!(typeof advancedOptions !== 'undefined')) {
                  _context8.next = 36;
                  break;
                }

                _error5 = new Errors.InvalidParamError();

                this._fillOpStatusByError(_error5);

                throw _error5;

              case 36:
                do {
                  reqId = this._getReqId();
                } while (reqId in this._calls);

                this._calls[reqId] = callbacks; // WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]

                msg = [_constants.WAMP_MSG_SPEC.CALL, reqId, options, topicURI];

                if (!(payload !== null && typeof payload !== 'undefined')) {
                  _context8.next = 44;
                  break;
                }

                res = this._packPPTPayload(payload, options);

                if (!res.err) {
                  _context8.next = 43;
                  break;
                }

                throw this._cache.opStatus.error;

              case 43:
                msg = msg.concat(res.payloadItems);

              case 44:
                this._send(msg);

                this._cache.opStatus = _constants.SUCCESS;
                this._cache.opStatus.reqId = reqId;
                return _context8.abrupt("return", callbacks.promise);

              case 48:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function call(_x14, _x15, _x16) {
        return _call.apply(this, arguments);
      }

      return call;
    }()
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

  }, {
    key: "cancel",
    value: function cancel(reqId, advancedOptions) {
      var options = {};

      if (!this._preReqChecks(null, 'dealer')) {
        throw this._cache.opStatus.error;
      }

      if (!reqId || !this._calls[reqId]) {
        var error = new Errors.NonExistRPCReqIdError();

        this._fillOpStatusByError(error);

        throw error;
      }

      if (this._isPlainObject(advancedOptions)) {
        if (Object.hasOwnProperty.call(advancedOptions, 'mode')) {
          if (/skip|kill|killnowait/.test(advancedOptions.mode)) {
            options.mode = advancedOptions.mode;
          } else {
            var _error6 = new Errors.InvalidParamError();

            this._fillOpStatusByError(_error6);

            throw _error6;
          }
        }
      } else if (typeof advancedOptions !== 'undefined') {
        var _error7 = new Errors.InvalidParamError();

        this._fillOpStatusByError(_error7);

        throw _error7;
      } // WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]


      this._send([_constants.WAMP_MSG_SPEC.CANCEL, reqId, options]);

      this._cache.opStatus = _constants.SUCCESS;
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

  }, {
    key: "register",
    value: function () {
      var _register = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(topicURI, rpc, advancedOptions) {
        var reqId, patternBased, options, callbacks, error, _error8, _error9, _error10, _error11;

        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                patternBased = false;
                options = {}, callbacks = (0, _utils.getNewPromise)();

                if (!this._isPlainObject(advancedOptions)) {
                  _context9.next = 22;
                  break;
                }

                if (!Object.hasOwnProperty.call(advancedOptions, 'match')) {
                  _context9.next = 12;
                  break;
                }

                if (!/prefix|wildcard/.test(advancedOptions.match)) {
                  _context9.next = 9;
                  break;
                }

                options.match = advancedOptions.match;
                patternBased = true;
                _context9.next = 12;
                break;

              case 9:
                error = new Errors.InvalidParamError();

                this._fillOpStatusByError(error);

                throw error;

              case 12:
                if (!Object.hasOwnProperty.call(advancedOptions, 'invoke')) {
                  _context9.next = 20;
                  break;
                }

                if (!/single|roundrobin|random|first|last/.test(advancedOptions.invoke)) {
                  _context9.next = 17;
                  break;
                }

                options.invoke = advancedOptions.invoke;
                _context9.next = 20;
                break;

              case 17:
                _error8 = new Errors.InvalidParamError();

                this._fillOpStatusByError(_error8);

                throw _error8;

              case 20:
                _context9.next = 26;
                break;

              case 22:
                if (!(typeof advancedOptions !== 'undefined')) {
                  _context9.next = 26;
                  break;
                }

                _error9 = new Errors.InvalidParamError();

                this._fillOpStatusByError(_error9);

                throw _error9;

              case 26:
                if (this._preReqChecks({
                  topic: topicURI,
                  patternBased: patternBased,
                  allowWAMP: false
                }, 'dealer')) {
                  _context9.next = 28;
                  break;
                }

                throw this._cache.opStatus.error;

              case 28:
                if (!(typeof rpc === 'function')) {
                  _context9.next = 32;
                  break;
                }

                callbacks.rpc = rpc;
                _context9.next = 35;
                break;

              case 32:
                _error10 = new Errors.NoCallbackError();

                this._fillOpStatusByError(_error10);

                throw _error10;

              case 35:
                if (!(!this._rpcRegs[topicURI] || !this._rpcRegs[topicURI].callbacks.length)) {
                  _context9.next = 43;
                  break;
                }

                // no such registration or processing unregistering
                reqId = this._getReqId();
                this._requests[reqId] = {
                  topic: topicURI,
                  callbacks: callbacks
                }; // WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]

                this._send([_constants.WAMP_MSG_SPEC.REGISTER, reqId, options, topicURI]);

                this._cache.opStatus = _constants.SUCCESS;
                this._cache.opStatus.reqId = reqId;
                _context9.next = 46;
                break;

              case 43:
                // already have registration with such topicURI
                _error11 = new Errors.RPCAlreadyRegisteredError();

                this._fillOpStatusByError(_error11);

                throw _error11;

              case 46:
                return _context9.abrupt("return", callbacks.promise);

              case 47:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function register(_x17, _x18, _x19) {
        return _register.apply(this, arguments);
      }

      return register;
    }()
    /**
     * RPC unregistration for invocation
     * @param {string} topicURI
     * @returns {Promise}
     */

  }, {
    key: "unregister",
    value: function () {
      var _unregister = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(topicURI) {
        var reqId, callbacks, error;
        return _regeneratorRuntime().wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                callbacks = (0, _utils.getNewPromise)();

                if (this._preReqChecks({
                  topic: topicURI,
                  patternBased: false,
                  allowWAMP: false
                }, 'dealer')) {
                  _context10.next = 3;
                  break;
                }

                throw this._cache.opStatus.error;

              case 3:
                if (!this._rpcRegs[topicURI]) {
                  _context10.next = 11;
                  break;
                }

                // there is such registration
                reqId = this._getReqId();
                this._requests[reqId] = {
                  topic: topicURI,
                  callbacks: callbacks
                }; // WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]

                this._send([_constants.WAMP_MSG_SPEC.UNREGISTER, reqId, this._rpcRegs[topicURI].id]);

                this._cache.opStatus = _constants.SUCCESS;
                this._cache.opStatus.reqId = reqId;
                _context10.next = 14;
                break;

              case 11:
                // there is no registration with such topicURI
                error = new Errors.NonExistRPCUnregistrationError();

                this._fillOpStatusByError(error);

                throw error;

              case 14:
                return _context10.abrupt("return", callbacks.promise);

              case 15:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function unregister(_x20) {
        return _unregister.apply(this, arguments);
      }

      return unregister;
    }()
  }]);

  return Wampy;
}();

exports.Wampy = Wampy;
var _default = Wampy;
exports["default"] = _default;
//# sourceMappingURL=wampy.js.map
