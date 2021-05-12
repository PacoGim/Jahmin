"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const aac_format_1 = require("../formats/aac.format");
const flac_format_1 = require("../formats/flac.format");
const mp3_format_1 = require("../formats/mp3.format");
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (options) => {
    if (options.task === 'Get Song Data') {
        getSongTags(options.data.path).then((data) => {
            worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
                task: options.task,
                data
            });
        });
    }
    if (options.task === 'Not Tasks Left') {
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
            task: options.task
        });
    }
});
function getSongTags(path) {
    return new Promise((resolve, reject) => {
        let extension = path.split('.').pop() || undefined;
        if (extension === 'm4a') {
            aac_format_1.getAacTags(path).then((data) => resolve(data));
        }
        else if (extension === 'flac') {
            flac_format_1.getFlacTags(path).then((data) => resolve(data));
        }
        else if (extension === 'mp3') {
            mp3_format_1.getMp3Tags(path).then((data) => resolve(data));
        }
    });
}
