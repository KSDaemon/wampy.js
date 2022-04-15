"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNode = exports.ALLOWED_BINARY_TYPES = exports.WAMP_MSG_SPEC = exports.WAMP_ERROR_MSG = exports.MsgpackSerializer = exports.JsonSerializer = exports.Wampy = void 0;
var wampy_1 = __importDefault(require("./wampy"));
exports.Wampy = wampy_1.default;
var constants_1 = require("./constants");
Object.defineProperty(exports, "WAMP_ERROR_MSG", { enumerable: true, get: function () { return constants_1.WAMP_ERROR_MSG; } });
Object.defineProperty(exports, "WAMP_MSG_SPEC", { enumerable: true, get: function () { return constants_1.WAMP_MSG_SPEC; } });
Object.defineProperty(exports, "isNode", { enumerable: true, get: function () { return constants_1.isNode; } });
Object.defineProperty(exports, "ALLOWED_BINARY_TYPES", { enumerable: true, get: function () { return constants_1.ALLOWED_BINARY_TYPES; } });
var JsonSerializer_1 = __importDefault(require("./serializers/JsonSerializer"));
exports.JsonSerializer = JsonSerializer_1.default;
var MsgpackSerializer_1 = __importDefault(require("./serializers/MsgpackSerializer"));
exports.MsgpackSerializer = MsgpackSerializer_1.default;
exports.default = wampy_1.default;
//# sourceMappingURL=index.js.map