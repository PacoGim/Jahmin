"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spark_md5_1 = __importDefault(require("spark-md5"));
const fs_1 = require("fs");
function default_1(filePath) {
    return new Promise((resolve, reject) => {
        let fileBuffer = (0, fs_1.readFileSync)(filePath);
        let hash = spark_md5_1.default.ArrayBuffer.hash(fileBuffer);
        resolve(hash);
    });
}
exports.default = default_1;
