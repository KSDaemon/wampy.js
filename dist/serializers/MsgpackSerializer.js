"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MsgpackSerializer = void 0;

var _msgpack = _interopRequireDefault(require("msgpack5"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var msgpack = (0, _msgpack["default"])();

var MsgpackSerializer =
/*#__PURE__*/
function () {
  function MsgpackSerializer() {
    _classCallCheck(this, MsgpackSerializer);

    this.protocol = 'msgpack';
    this.isBinary = true;
  }

  _createClass(MsgpackSerializer, [{
    key: "encode",
    value: function encode(data) {
      return msgpack.encode(data);
    }
  }, {
    key: "decode",
    value: function decode(data) {
      return new Promise(function (resolve) {
        var type = data.constructor.name;

        if (type === 'ArrayBuffer' || type === 'Buffer') {
          resolve(msgpack.decode(new Uint8Array(data)));
        } else {
          var reader = new FileReader();

          reader.onload = function () {
            resolve(msgpack.decode(new Uint8Array(this.result)));
          };

          reader.readAsArrayBuffer(data);
        }
      });
    }
  }]);

  return MsgpackSerializer;
}();

exports.MsgpackSerializer = MsgpackSerializer;
//# sourceMappingURL=MsgpackSerializer.js.map
