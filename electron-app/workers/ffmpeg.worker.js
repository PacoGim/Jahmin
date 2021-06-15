"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
let ffmpegPath = path_1.default.join(process.cwd(), '/electron-app/binaries/ffmpeg');
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (message) => {
    console.log(message);
    console.log(3, new Date().toTimeString());
    console.time();
    child_process_1.exec(
    // `"${ffmpegPath}" -i "${filePath}" -y -map_metadata 0:s:a:0 -codec copy ${ffmpegMetatagString} "${templFileName}" && mv "${templFileName}" "${filePath}"`,
    `ls`, (error, stdout, stderr) => {
        console.log('error: ', error);
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
    }).on('close', () => {
        console.timeEnd();
        console.log(4, new Date().toTimeString());
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage('Done');
        // resolve('Done')
    });
});
