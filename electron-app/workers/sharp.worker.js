"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const worker_threads_1 = require("worker_threads");
const original_fs_1 = require("original-fs");
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (data) => {
    const { dimension, artInputPath, artOutputDirPath, artOutputPath } = data;
    if (!fs_1.default.existsSync(artOutputDirPath)) {
        (0, original_fs_1.mkdirSync)(artOutputDirPath, { recursive: true });
    }
    let file = (0, original_fs_1.readFileSync)(artInputPath);
    (0, sharp_1.default)(file)
        .resize({
        height: dimension * 2,
        width: dimension * 2
    })
        .webp({
        quality: 85
    })
        .toFile(artOutputPath)
        .then(() => {
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(data);
    })
        .catch(err => {
        console.log(err);
        console.log(artInputPath);
    });
});
