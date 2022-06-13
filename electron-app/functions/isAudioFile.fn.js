"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const allowedSongExtensions_var_1 = __importDefault(require("../global/allowedSongExtensions.var"));
function default_1(path) {
    return allowedSongExtensions_var_1.default.includes(path.split('.').pop() || '');
}
exports.default = default_1;
