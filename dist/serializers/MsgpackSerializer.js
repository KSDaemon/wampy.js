'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MsgpackSerializer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _msgpack = require('msgpack5');

var _msgpack2 = _interopRequireDefault(_msgpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var msgpack = (0, _msgpack2.default)();

var MsgpackSerializer = exports.MsgpackSerializer = function () {
    function MsgpackSerializer() {
        _classCallCheck(this, MsgpackSerializer);

        this.protocol = 'msgpack';
        this.binaryType = 'arraybuffer';
    }

    _createClass(MsgpackSerializer, [{
        key: 'encode',
        value: function encode(data) {
            return msgpack.encode(data);
        }
    }, {
        key: 'decode',
        value: function decode(data) {
            return new Promise(function (resolve) {

                if (data instanceof ArrayBuffer) {
                    resolve(msgpack.decode(new Uint8Array(data)));
                } else {
                    var reader = new FileReader();
                    reader.onload = function () {
                        resolve(new Uint8Array(this.result));
                    };
                    reader.readAsArrayBuffer(data);
                }
            });
        }
    }]);

    return MsgpackSerializer;
}();
//# sourceMappingURL=MsgpackSerializer.js.map
