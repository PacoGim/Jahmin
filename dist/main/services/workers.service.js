"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killWorker = exports.killAllWorkers = exports.getWorker = void 0;
const worker_threads_1 = require("worker_threads");
const path_1 = require("path");
let workersName = [
    'exifToolRead',
    'exifToolWrite',
    'ffmpeg',
    'ffmpegImage',
    'musicMetadata',
    'nodeID3',
    'sharp',
    'songFilter'
];
let workers = [];
function getWorker(workerName) {
    return new Promise((resolve, reject) => {
        let worker = workers.find(worker => worker.name === workerName);
        if (worker === undefined) {
            let newWorker = new worker_threads_1.Worker((0, path_1.join)(__dirname, `../workers/${workerName}.worker.js`));
            workers.push({
                id: newWorker.threadId,
                name: workerName,
                worker: newWorker
            });
            resolve(newWorker);
        }
        else {
            resolve(worker === null || worker === void 0 ? void 0 : worker.worker);
        }
    });
}
exports.getWorker = getWorker;
function killAllWorkers() {
    workers.forEach(worker => worker.worker.terminate());
}
exports.killAllWorkers = killAllWorkers;
function killWorker(workerName) {
    workers.filter(worker => worker.name === workerName).forEach(worker => worker.worker.terminate());
}
exports.killWorker = killWorker;
