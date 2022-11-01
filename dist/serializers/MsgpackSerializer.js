"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MsgpackSerializer = void 0;

var _msgpackr = require("msgpackr");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var MsgpackSerializer = /*#__PURE__*/function () {
  function MsgpackSerializer() {
    _classCallCheck(this, MsgpackSerializer);

    this.protocol = 'msgpack';
    this.isBinary = true;
  }

  _createClass(MsgpackSerializer, [{
    key: "encode",
    value: function encode(data) {
      return (0, _msgpackr.pack)(data);
    }
  }, {
    key: "decode",
    value: function decode(data) {
      return (0, _msgpackr.unpack)(new Uint8Array(data));
    }
  }]);

  return MsgpackSerializer;
}();

exports.MsgpackSerializer = MsgpackSerializer;
//# sourceMappingURL=MsgpackSerializer.js.map
