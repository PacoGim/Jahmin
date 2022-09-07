"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spark_md5_1 = __importDefault(require("spark-md5"));
function default_1(arrayBuffer) {
    return spark_md5_1.default.ArrayBuffer.hash(arrayBuffer);
}
exports.default = default_1;
