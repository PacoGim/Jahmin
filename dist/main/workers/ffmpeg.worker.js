"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const path_1 = require("path");
const getOs_fn_1 = __importDefault(require("../functions/getOs.fn"));
let os /* Operating system */ = (0, getOs_fn_1.default)();
let ffmpegPath = (0, path_1.join)(__dirname, `../../binaries/${os}/ffmpeg`);
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', message => {
    let { id, filePath, tempFileName, command } = message;
    let status = -1;
    (0, child_process_1.spawn)(`"${ffmpegPath}" ${command}`, [], { shell: true }).on('close', code => {
        if (code === 0) {
            status = 1;
        }
        else {
            status = 0;
        }
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ id, filePath, tempFileName, status });
    });
});
