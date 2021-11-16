"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = void 0;
const string_hash_1 = __importDefault(require("string-hash"));
function hash(stringToHash, format = 'text') {
    if (format === 'text') {
        return (0, string_hash_1.default)(stringToHash).toString(36);
    }
    else {
        return (0, string_hash_1.default)(stringToHash);
    }
}
exports.hash = hash;
