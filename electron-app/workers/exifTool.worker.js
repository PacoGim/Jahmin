"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const exiftool_vendored_1 = require("exiftool-vendored");
const exiftool = new exiftool_vendored_1.ExifTool({ taskTimeoutMillis: 5000 });
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (filePath) => {
    exiftool.read(filePath).then((metadata) => {
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ filePath, metadata });
    });
});
