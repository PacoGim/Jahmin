"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.killWorker = exports.killAllWorkers = exports.getWorker = void 0;
const worker_threads_1 = require("worker_threads");
const path_1 = require("path");
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
let workersName = [
    'exifToolRead',
    'exifToolWrite',
    'ffmpeg',
    'ffmpegImage',
    'musicMetadata',
    'nodeID3',
    'sharp',
    'songFilter',
    'database'
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
            if (workerName === 'database') {
                initDbWorker();
            }
        }
        else {
            resolve(worker?.worker);
        }
    });
}
exports.getWorker = getWorker;
async function initDbWorker() {
    let dbWorker = await getWorker('database');
    dbWorker.postMessage({
        type: 'initDb',
        data: {
            appDataPath: (0, getAppDataPath_fn_1.default)()
        }
    });
}
function killAllWorkers() {
    workers.forEach(worker => worker.worker.terminate());
}
exports.killAllWorkers = killAllWorkers;
function killWorker(workerName) {
    workers.filter(worker => worker.name === workerName).forEach(worker => worker.worker.terminate());
}
exports.killWorker = killWorker;
