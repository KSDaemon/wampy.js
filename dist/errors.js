"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebsocketError = exports.WampError = exports.UriError = exports.UnsubscribeError = exports.UnregisterError = exports.SubscribeError = exports.RegisterError = exports.RPCAlreadyRegisteredError = exports.PublishError = exports.ProtocolViolationError = exports.PPTSerializerInvalidError = exports.PPTSerializationError = exports.PPTNotSupportedError = exports.PPTInvalidSchemeError = exports.NonExistUnsubscribeError = exports.NonExistRPCUnregistrationError = exports.NonExistRPCReqIdError = exports.NonExistRPCInvocationError = exports.NoWsOrUrlError = exports.NoSerializerAvailableError = exports.NoRealmError = exports.NoDealerError = exports.NoCallbackError = exports.NoCRACallbackOrIdError = exports.NoBrokerError = exports.InvalidParamError = exports.ChallengeExceptionError = exports.CallError = exports.AbortError = void 0;

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

  function InvalidParamError(parameter) {
    var _this4;

    _classCallCheck(this, InvalidParamError);

    _this4 = _super4.call(this, _constants.WAMP_ERROR_MSG.INVALID_PARAM);
    _this4.name = 'InvalidParamError';
    _this4.code = 4;
    _this4.parameter = parameter;
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
    _this14.errorUri = 'wamp.error.cannot_authenticate';
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
    _this15.errorUri = 'wamp.error.cannot_authenticate';
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

var ProtocolViolationError = /*#__PURE__*/function (_Error20) {
  _inherits(ProtocolViolationError, _Error20);

  var _super20 = _createSuper(ProtocolViolationError);

  function ProtocolViolationError(errorUri, details) {
    var _this20;

    _classCallCheck(this, ProtocolViolationError);

    _this20 = _super20.call(this, details || _constants.WAMP_ERROR_MSG.PROTOCOL_VIOLATION);
    _this20.name = 'ProtocolViolationError';
    _this20.code = 29;
    _this20.errorUri = errorUri;
    return _this20;
  }

  return _createClass(ProtocolViolationError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.ProtocolViolationError = ProtocolViolationError;

var AbortError = /*#__PURE__*/function (_Error21) {
  _inherits(AbortError, _Error21);

  var _super21 = _createSuper(AbortError);

  function AbortError(_ref) {
    var _this21;

    var error = _ref.error,
        details = _ref.details;

    _classCallCheck(this, AbortError);

    _this21 = _super21.call(this, _constants.WAMP_ERROR_MSG.WAMP_ABORT);
    _this21.name = 'AbortedError';
    _this21.code = 30;
    _this21.errorUri = error;
    _this21.details = details;
    return _this21;
  }

  return _createClass(AbortError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.AbortError = AbortError;

var WampError = /*#__PURE__*/function (_Error22) {
  _inherits(WampError, _Error22);

  var _super22 = _createSuper(WampError);

  function WampError(_ref2) {
    var _this22;

    var error = _ref2.error,
        details = _ref2.details,
        argsList = _ref2.argsList,
        argsDict = _ref2.argsDict;

    _classCallCheck(this, WampError);

    _this22 = _super22.call(this, _constants.WAMP_ERROR_MSG.WAMP_GENERAL_ERROR);
    _this22.name = 'WampError';
    _this22.code = 31;
    _this22.errorUri = error;
    _this22.details = details;
    _this22.argsList = argsList;
    _this22.argsDict = argsDict;
    return _this22;
  }

  return _createClass(WampError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.WampError = WampError;

var SubscribeError = /*#__PURE__*/function (_WampError) {
  _inherits(SubscribeError, _WampError);

  var _super23 = _createSuper(SubscribeError);

  function SubscribeError(_ref3) {
    var _this23;

    var error = _ref3.error,
        details = _ref3.details,
        argsList = _ref3.argsList,
        argsDict = _ref3.argsDict;

    _classCallCheck(this, SubscribeError);

    _this23 = _super23.call(this, {
      error: error,
      details: details,
      argsList: argsList,
      argsDict: argsDict
    });
    _this23.name = 'SubscribeError';
    _this23.code = 32;
    return _this23;
  }

  return _createClass(SubscribeError);
}(WampError);

exports.SubscribeError = SubscribeError;

var UnsubscribeError = /*#__PURE__*/function (_WampError2) {
  _inherits(UnsubscribeError, _WampError2);

  var _super24 = _createSuper(UnsubscribeError);

  function UnsubscribeError(_ref4) {
    var _this24;

    var error = _ref4.error,
        details = _ref4.details,
        argsList = _ref4.argsList,
        argsDict = _ref4.argsDict;

    _classCallCheck(this, UnsubscribeError);

    _this24 = _super24.call(this, {
      error: error,
      details: details,
      argsList: argsList,
      argsDict: argsDict
    });
    _this24.name = 'UnsubscribeError';
    _this24.code = 33;
    return _this24;
  }

  return _createClass(UnsubscribeError);
}(WampError);

exports.UnsubscribeError = UnsubscribeError;

var PublishError = /*#__PURE__*/function (_WampError3) {
  _inherits(PublishError, _WampError3);

  var _super25 = _createSuper(PublishError);

  function PublishError(_ref5) {
    var _this25;

    var error = _ref5.error,
        details = _ref5.details,
        argsList = _ref5.argsList,
        argsDict = _ref5.argsDict;

    _classCallCheck(this, PublishError);

    _this25 = _super25.call(this, {
      error: error,
      details: details,
      argsList: argsList,
      argsDict: argsDict
    });
    _this25.name = 'PublishError';
    _this25.code = 34;
    return _this25;
  }

  return _createClass(PublishError);
}(WampError);

exports.PublishError = PublishError;

var RegisterError = /*#__PURE__*/function (_WampError4) {
  _inherits(RegisterError, _WampError4);

  var _super26 = _createSuper(RegisterError);

  function RegisterError(_ref6) {
    var _this26;

    var error = _ref6.error,
        details = _ref6.details,
        argsList = _ref6.argsList,
        argsDict = _ref6.argsDict;

    _classCallCheck(this, RegisterError);

    _this26 = _super26.call(this, {
      error: error,
      details: details,
      argsList: argsList,
      argsDict: argsDict
    });
    _this26.name = 'RegisterError';
    _this26.code = 35;
    return _this26;
  }

  return _createClass(RegisterError);
}(WampError);

exports.RegisterError = RegisterError;

var UnregisterError = /*#__PURE__*/function (_WampError5) {
  _inherits(UnregisterError, _WampError5);

  var _super27 = _createSuper(UnregisterError);

  function UnregisterError(_ref7) {
    var _this27;

    var error = _ref7.error,
        details = _ref7.details,
        argsList = _ref7.argsList,
        argsDict = _ref7.argsDict;

    _classCallCheck(this, UnregisterError);

    _this27 = _super27.call(this, {
      error: error,
      details: details,
      argsList: argsList,
      argsDict: argsDict
    });
    _this27.name = 'UnregisterError';
    _this27.code = 36;
    return _this27;
  }

  return _createClass(UnregisterError);
}(WampError);

exports.UnregisterError = UnregisterError;

var CallError = /*#__PURE__*/function (_WampError6) {
  _inherits(CallError, _WampError6);

  var _super28 = _createSuper(CallError);

  function CallError(_ref8) {
    var _this28;

    var error = _ref8.error,
        details = _ref8.details,
        argsList = _ref8.argsList,
        argsDict = _ref8.argsDict;

    _classCallCheck(this, CallError);

    _this28 = _super28.call(this, {
      error: error,
      details: details,
      argsList: argsList,
      argsDict: argsDict
    });
    _this28.name = 'CallError';
    _this28.code = 37;
    return _this28;
  }

  return _createClass(CallError);
}(WampError);

exports.CallError = CallError;

var WebsocketError = /*#__PURE__*/function (_Error23) {
  _inherits(WebsocketError, _Error23);

  var _super29 = _createSuper(WebsocketError);

  function WebsocketError(error) {
    var _this29;

    _classCallCheck(this, WebsocketError);

    _this29 = _super29.call(this, _constants.WAMP_ERROR_MSG.WEBSOCKET_ERROR);
    _this29.name = 'WebsocketError';
    _this29.code = 38;
    _this29.error = error;
    return _this29;
  }

  return _createClass(WebsocketError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.WebsocketError = WebsocketError;
//# sourceMappingURL=errors.js.map
