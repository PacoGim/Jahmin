"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (message) => {
    let { id, filePath, tempFileName, command } = message;
    let status = -1;
    child_process_1.exec(command, (error, stdout, stderr) => {
        if (error)
            status = -1;
        if (stdout || stderr) {
            status = 1;
        }
    }).on('close', () => {
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ id, filePath, tempFileName, status });
    });
});
