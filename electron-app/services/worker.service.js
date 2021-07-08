"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.killWorker = exports.getWorker = exports.killAllWorkers = exports.initWorkers = void 0;
const worker_threads_1 = require("worker_threads");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const TOTAL_CPUS = os_1.cpus().length;
const WORKER_FOLDER_PATH = path_1.default.join(path_1.default.resolve(), 'electron-app/workers');
let workers = [];
function initWorkers() {
    let workerFiles = fs_1.default.readdirSync(WORKER_FOLDER_PATH);
    workerFiles.forEach((workerFile) => {
        let worker = new worker_threads_1.Worker(getWorkerPath(workerFile));
        workers.push({
            id: worker.threadId,
            name: workerFile.replace('.worker.js', ''),
            worker
        });
    });
}
exports.initWorkers = initWorkers;
function killAllWorkers() {
    workers.forEach((worker) => worker.worker.terminate());
}
exports.killAllWorkers = killAllWorkers;
function getWorker(name) {
    var _a;
    let workerFound = (_a = workers.find((worker) => worker.name === name)) === null || _a === void 0 ? void 0 : _a.worker;
    if (name === 'exifToolWrite') {
        console.log(',,,,,,,,,,,,,,,');
        console.log(name);
        console.log(workers);
        // workers.find((worker) => {
        // 	console.log(worker)
        // })
    }
    if (workerFound) {
        return workerFound;
    }
    else {
        return undefined;
    }
}
exports.getWorker = getWorker;
function killWorker(name) {
    workers.filter((worker) => worker.name === name).forEach((worker) => worker.worker.terminate());
}
exports.killWorker = killWorker;
function getWorkerPath(workerName) {
    return path_1.default.join(WORKER_FOLDER_PATH, workerName);
}
