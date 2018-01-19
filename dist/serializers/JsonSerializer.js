'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JsonSerializer = exports.JsonSerializer = function () {
    function JsonSerializer() {
        _classCallCheck(this, JsonSerializer);

        this.protocol = 'json';
        this.isBinary = true;
    }

    _createClass(JsonSerializer, [{
        key: 'encode',
        value: function encode(data) {
            return JSON.stringify(data);
        }
    }, {
        key: 'decode',
        value: function decode(data) {
            return new Promise(function (resolve) {
                resolve(JSON.parse(data));
            });
        }
    }]);

    return JsonSerializer;
}();
//# sourceMappingURL=JsonSerializer.js.map
