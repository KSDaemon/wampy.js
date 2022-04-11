"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.MsgpackSerializer = void 0;
var msgpack5_1 = __importDefault(require("msgpack5"));
var msgpack = (0, msgpack5_1["default"])();
var MsgpackSerializer = /** @class */ (function () {
    function MsgpackSerializer() {
        this.protocol = "msgpack";
        this.isBinary = true;
    }
    MsgpackSerializer.prototype.encode = function (data) {
        return msgpack.encode(data);
    };
    MsgpackSerializer.prototype.decode = function (data) {
        return new Promise(function (resolve) {
            var type = data.constructor.name;
            if (type === "ArrayBuffer" || type === "Buffer") {
                resolve(msgpack.decode(Buffer.from(new Uint8Array(data))));
            }
            else {
                var reader = new FileReader();
                reader.onload = function () {
                    resolve(msgpack.decode(Buffer.from(new Uint8Array(this.result))));
                };
                reader.readAsArrayBuffer(data);
            }
        });
    };
    return MsgpackSerializer;
}());
exports.MsgpackSerializer = MsgpackSerializer;
//# sourceMappingURL=MsgpackSerializer.js.map