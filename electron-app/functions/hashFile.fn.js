"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const spark_md5_1 = __importDefault(require("spark-md5"));
function default_1(filePath) {
    return new Promise((resolve, reject) => {
        let file = fs_1.default.readFileSync(filePath);
        let hash = spark_md5_1.default.ArrayBuffer.hash(file);
        resolve(hash);
    });
}
exports.default = default_1;
