"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp = require('sharp');
const worker_threads_1 = require("worker_threads");
const typeOf_fn_1 = __importDefault(require("../functions/typeOf.fn"));
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (data) => {
    const { artData, artPath, elementId, size } = data;
    let sharpData = undefined;
    if ((0, typeOf_fn_1.default)(artData) === 'Uint8Array') {
        sharpData = artData;
    }
    sharp(artData)
        .resize({
        height: size * 2,
        width: size * 2
    })
        .avif({
        quality: 64
    })
        .toFile(artPath)
        .then(() => {
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(data);
    })
        .catch((err) => {
        console.log(err);
    });
});
