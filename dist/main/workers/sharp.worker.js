"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const sharp_1 = __importDefault(require("sharp"));
const typeOf_fn_1 = __importDefault(require("../functions/typeOf.fn"));
let sharpQueue = [];
let isSharpQueueRunning = false;
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (data) => {
    sharpQueue.push(data);
    if (isSharpQueueRunning === true) {
        return;
    }
    else {
        isSharpQueueRunning = true;
        compressImage();
    }
});
function compressImage() {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
        type: 'artQueueLength',
        data: sharpQueue.length
    });
    let task = sharpQueue.shift();
    if (task === undefined) {
        isSharpQueueRunning = false;
        return;
    }
    const { artData, artPath, elementId, size } = task;
    let sharpData = undefined;
    if ((0, typeOf_fn_1.default)(artData) === 'Uint8Array') {
        sharpData = artData;
    }
    (0, sharp_1.default)(artData)
        .resize({
        height: size * 2,
        width: size * 2
    })
        .webp({
        quality: 82
    })
        .toFile(artPath)
        .then(() => {
        setTimeout(() => compressImage(), 100);
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
            type: 'imageCompression',
            data: task
        });
    })
        .catch((err) => {
        console.log(err);
    });
}
