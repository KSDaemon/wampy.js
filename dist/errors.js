"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UriError = exports.RPCAlreadyRegisteredError = exports.PPTSerializerInvalidError = exports.PPTSerializationError = exports.PPTNotSupportedError = exports.PPTInvalidSchemeError = exports.NonExistUnsubscribeError = exports.NonExistRPCUnregistrationError = exports.NonExistRPCReqIdError = exports.NonExistRPCInvocationError = exports.NoWsOrUrlError = exports.NoSerializerAvailableError = exports.NoRealmError = exports.NoDealerError = exports.NoCallbackError = exports.NoCRACallbackOrIdError = exports.NoBrokerError = exports.InvalidParamError = exports.ChallengeExceptionError = void 0;

var _constants = require("./constants.js");

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var UriError = /*#__PURE__*/function (_Error) {
  _inherits(UriError, _Error);

  var _super = _createSuper(UriError);

  function UriError() {
    var _this;

    _classCallCheck(this, UriError);

    _this = _super.call(this, _constants.WAMP_ERROR_MSG.URI_ERROR);
    _this.name = 'UriError';
    _this.code = 1;
    return _this;
  }

  return _createClass(UriError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.UriError = UriError;

var NoBrokerError = /*#__PURE__*/function (_Error2) {
  _inherits(NoBrokerError, _Error2);

  var _super2 = _createSuper(NoBrokerError);

  function NoBrokerError() {
    var _this2;

    _classCallCheck(this, NoBrokerError);

    _this2 = _super2.call(this, _constants.WAMP_ERROR_MSG.NO_BROKER);
    _this2.name = 'NoBrokerError';
    _this2.code = 2;
    return _this2;
  }

  return _createClass(NoBrokerError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NoBrokerError = NoBrokerError;

var NoCallbackError = /*#__PURE__*/function (_Error3) {
  _inherits(NoCallbackError, _Error3);

  var _super3 = _createSuper(NoCallbackError);

  function NoCallbackError() {
    var _this3;

    _classCallCheck(this, NoCallbackError);

    _this3 = _super3.call(this, _constants.WAMP_ERROR_MSG.NO_CALLBACK_SPEC);
    _this3.name = 'NoCallbackError';
    _this3.code = 3;
    return _this3;
  }

  return _createClass(NoCallbackError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NoCallbackError = NoCallbackError;

var InvalidParamError = /*#__PURE__*/function (_Error4) {
  _inherits(InvalidParamError, _Error4);

  var _super4 = _createSuper(InvalidParamError);

  function InvalidParamError() {
    var _this4;

    _classCallCheck(this, InvalidParamError);

    _this4 = _super4.call(this, _constants.WAMP_ERROR_MSG.INVALID_PARAM);
    _this4.name = 'InvalidParamError';
    _this4.code = 4;
    return _this4;
  }

  return _createClass(InvalidParamError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.InvalidParamError = InvalidParamError;

var NoSerializerAvailableError = /*#__PURE__*/function (_Error5) {
  _inherits(NoSerializerAvailableError, _Error5);

  var _super5 = _createSuper(NoSerializerAvailableError);

  function NoSerializerAvailableError() {
    var _this5;

    _classCallCheck(this, NoSerializerAvailableError);

    _this5 = _super5.call(this, _constants.WAMP_ERROR_MSG.NO_SERIALIZER_AVAILABLE);
    _this5.name = 'NoSerializerAvailableError';
    _this5.code = 6;
    return _this5;
  }

  return _createClass(NoSerializerAvailableError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NoSerializerAvailableError = NoSerializerAvailableError;

var NonExistUnsubscribeError = /*#__PURE__*/function (_Error6) {
  _inherits(NonExistUnsubscribeError, _Error6);

  var _super6 = _createSuper(NonExistUnsubscribeError);

  function NonExistUnsubscribeError() {
    var _this6;

    _classCallCheck(this, NonExistUnsubscribeError);

    _this6 = _super6.call(this, _constants.WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE);
    _this6.name = 'NonExistUnsubscribeError';
    _this6.code = 7;
    return _this6;
  }

  return _createClass(NonExistUnsubscribeError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NonExistUnsubscribeError = NonExistUnsubscribeError;

var NoDealerError = /*#__PURE__*/function (_Error7) {
  _inherits(NoDealerError, _Error7);

  var _super7 = _createSuper(NoDealerError);

  function NoDealerError() {
    var _this7;

    _classCallCheck(this, NoDealerError);

    _this7 = _super7.call(this, _constants.WAMP_ERROR_MSG.NO_DEALER);
    _this7.name = 'NoDealerError';
    _this7.code = 12;
    return _this7;
  }

  return _createClass(NoDealerError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NoDealerError = NoDealerError;

var RPCAlreadyRegisteredError = /*#__PURE__*/function (_Error8) {
  _inherits(RPCAlreadyRegisteredError, _Error8);

  var _super8 = _createSuper(RPCAlreadyRegisteredError);

  function RPCAlreadyRegisteredError() {
    var _this8;

    _classCallCheck(this, RPCAlreadyRegisteredError);

    _this8 = _super8.call(this, _constants.WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED);
    _this8.name = 'RPCAlreadyRegisteredError';
    _this8.code = 15;
    return _this8;
  }

  return _createClass(RPCAlreadyRegisteredError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.RPCAlreadyRegisteredError = RPCAlreadyRegisteredError;

var NonExistRPCUnregistrationError = /*#__PURE__*/function (_Error9) {
  _inherits(NonExistRPCUnregistrationError, _Error9);

  var _super9 = _createSuper(NonExistRPCUnregistrationError);

  function NonExistRPCUnregistrationError() {
    var _this9;

    _classCallCheck(this, NonExistRPCUnregistrationError);

    _this9 = _super9.call(this, _constants.WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG);
    _this9.name = 'NonExistRPCUnregistrationError';
    _this9.code = 17;
    return _this9;
  }

  return _createClass(NonExistRPCUnregistrationError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NonExistRPCUnregistrationError = NonExistRPCUnregistrationError;

var NonExistRPCInvocationError = /*#__PURE__*/function (_Error10) {
  _inherits(NonExistRPCInvocationError, _Error10);

  var _super10 = _createSuper(NonExistRPCInvocationError);

  function NonExistRPCInvocationError() {
    var _this10;

    _classCallCheck(this, NonExistRPCInvocationError);

    _this10 = _super10.call(this, _constants.WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION);
    _this10.name = 'NonExistRPCInvocationError';
    _this10.code = 19;
    return _this10;
  }

  return _createClass(NonExistRPCInvocationError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NonExistRPCInvocationError = NonExistRPCInvocationError;

var NonExistRPCReqIdError = /*#__PURE__*/function (_Error11) {
  _inherits(NonExistRPCReqIdError, _Error11);

  var _super11 = _createSuper(NonExistRPCReqIdError);

  function NonExistRPCReqIdError() {
    var _this11;

    _classCallCheck(this, NonExistRPCReqIdError);

    _this11 = _super11.call(this, _constants.WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID);
    _this11.name = 'NonExistRPCReqIdError';
    _this11.code = 20;
    return _this11;
  }

  return _createClass(NonExistRPCReqIdError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NonExistRPCReqIdError = NonExistRPCReqIdError;

var NoRealmError = /*#__PURE__*/function (_Error12) {
  _inherits(NoRealmError, _Error12);

  var _super12 = _createSuper(NoRealmError);

  function NoRealmError() {
    var _this12;

    _classCallCheck(this, NoRealmError);

    _this12 = _super12.call(this, _constants.WAMP_ERROR_MSG.NO_REALM);
    _this12.name = 'NoRealmError';
    _this12.code = 21;
    return _this12;
  }

  return _createClass(NoRealmError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NoRealmError = NoRealmError;

var NoWsOrUrlError = /*#__PURE__*/function (_Error13) {
  _inherits(NoWsOrUrlError, _Error13);

  var _super13 = _createSuper(NoWsOrUrlError);

  function NoWsOrUrlError() {
    var _this13;

    _classCallCheck(this, NoWsOrUrlError);

    _this13 = _super13.call(this, _constants.WAMP_ERROR_MSG.NO_WS_OR_URL);
    _this13.name = 'NoWsOrUrlError';
    _this13.code = 22;
    return _this13;
  }

  return _createClass(NoWsOrUrlError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NoWsOrUrlError = NoWsOrUrlError;

var NoCRACallbackOrIdError = /*#__PURE__*/function (_Error14) {
  _inherits(NoCRACallbackOrIdError, _Error14);

  var _super14 = _createSuper(NoCRACallbackOrIdError);

  function NoCRACallbackOrIdError() {
    var _this14;

    _classCallCheck(this, NoCRACallbackOrIdError);

    _this14 = _super14.call(this, _constants.WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);
    _this14.name = 'NoCRACallbackOrIdError';
    _this14.code = 23;
    return _this14;
  }

  return _createClass(NoCRACallbackOrIdError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.NoCRACallbackOrIdError = NoCRACallbackOrIdError;

var ChallengeExceptionError = /*#__PURE__*/function (_Error15) {
  _inherits(ChallengeExceptionError, _Error15);

  var _super15 = _createSuper(ChallengeExceptionError);

  function ChallengeExceptionError() {
    var _this15;

    _classCallCheck(this, ChallengeExceptionError);

    _this15 = _super15.call(this, _constants.WAMP_ERROR_MSG.CHALLENGE_EXCEPTION);
    _this15.name = 'ChallengeExceptionError';
    _this15.code = 24;
    return _this15;
  }

  return _createClass(ChallengeExceptionError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.ChallengeExceptionError = ChallengeExceptionError;

var PPTNotSupportedError = /*#__PURE__*/function (_Error16) {
  _inherits(PPTNotSupportedError, _Error16);

  var _super16 = _createSuper(PPTNotSupportedError);

  function PPTNotSupportedError() {
    var _this16;

    _classCallCheck(this, PPTNotSupportedError);

    _this16 = _super16.call(this, _constants.WAMP_ERROR_MSG.PPT_NOT_SUPPORTED);
    _this16.name = 'PPTNotSupportedError';
    _this16.code = 25;
    return _this16;
  }

  return _createClass(PPTNotSupportedError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.PPTNotSupportedError = PPTNotSupportedError;

var PPTInvalidSchemeError = /*#__PURE__*/function (_Error17) {
  _inherits(PPTInvalidSchemeError, _Error17);

  var _super17 = _createSuper(PPTInvalidSchemeError);

  function PPTInvalidSchemeError() {
    var _this17;

    _classCallCheck(this, PPTInvalidSchemeError);

    _this17 = _super17.call(this, _constants.WAMP_ERROR_MSG.PPT_INVALID_SCHEME);
    _this17.name = 'PPTInvalidSchemeError';
    _this17.code = 26;
    return _this17;
  }

  return _createClass(PPTInvalidSchemeError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.PPTInvalidSchemeError = PPTInvalidSchemeError;

var PPTSerializerInvalidError = /*#__PURE__*/function (_Error18) {
  _inherits(PPTSerializerInvalidError, _Error18);

  var _super18 = _createSuper(PPTSerializerInvalidError);

  function PPTSerializerInvalidError() {
    var _this18;

    _classCallCheck(this, PPTSerializerInvalidError);

    _this18 = _super18.call(this, _constants.WAMP_ERROR_MSG.PPT_SRLZ_INVALID);
    _this18.name = 'PPTSerializerInvalidError';
    _this18.code = 27;
    return _this18;
  }

  return _createClass(PPTSerializerInvalidError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.PPTSerializerInvalidError = PPTSerializerInvalidError;

var PPTSerializationError = /*#__PURE__*/function (_Error19) {
  _inherits(PPTSerializationError, _Error19);

  var _super19 = _createSuper(PPTSerializationError);

  function PPTSerializationError() {
    var _this19;

    _classCallCheck(this, PPTSerializationError);

    _this19 = _super19.call(this, _constants.WAMP_ERROR_MSG.PPT_SRLZ_ERR);
    _this19.name = 'PPTSerializationError';
    _this19.code = 28;
    return _this19;
  }

  return _createClass(PPTSerializationError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.PPTSerializationError = PPTSerializationError;
//# sourceMappingURL=errors.js.map
