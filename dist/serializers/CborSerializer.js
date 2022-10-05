"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CborSerializer = void 0;

var _cbor = _interopRequireDefault(require("cbor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var CborSerializer = /*#__PURE__*/function () {
  function CborSerializer() {
    _classCallCheck(this, CborSerializer);

    this.protocol = 'cbor';
    this.isBinary = true;
  }

  _createClass(CborSerializer, [{
    key: "encode",
    value: function encode(data) {
      return _cbor["default"].encode(data);
    }
  }, {
    key: "decode",
    value: function decode(data) {
      return new Promise(function (resolve) {
        resolve(_cbor["default"].decode(data));
      });
    }
  }]);

  return CborSerializer;
}();

exports.CborSerializer = CborSerializer;
//# sourceMappingURL=CborSerializer.js.map
