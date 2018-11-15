"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonSerializer = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var JsonSerializer =
/*#__PURE__*/
function () {
  function JsonSerializer() {
    _classCallCheck(this, JsonSerializer);

    this.protocol = 'json';
    this.isBinary = true;
  }

  _createClass(JsonSerializer, [{
    key: "encode",
    value: function encode(data) {
      return JSON.stringify(data);
    }
  }, {
    key: "decode",
    value: function decode(data) {
      return new Promise(function (resolve) {
        resolve(JSON.parse(data));
      });
    }
  }]);

  return JsonSerializer;
}();

exports.JsonSerializer = JsonSerializer;
//# sourceMappingURL=JsonSerializer.js.map
