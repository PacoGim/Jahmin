"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSongDataWorkers = exports.getSongFilterWorker = exports.killAllWorkers = exports.initWorkers = void 0;
const worker_threads_1 = require("worker_threads");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const TOTAL_CPUS = os_1.cpus().length;
const WORKER_FOLDER_PATH = path_1.default.join(path_1.default.resolve(), 'electron-app/workers');
let workers = [];
function initWorkers() {
    const SONG_WORKER_QTY = TOTAL_CPUS >= 2 ? 2 : 1;
    // Song Data Scan Multi Workers
    for (let i = 0; i !== SONG_WORKER_QTY; i++) {
        const workerSongData = new worker_threads_1.Worker(getWorkerPath('folderScan'));
        workers.push({
            id: workerSongData.threadId,
            type: 'SongData',
            worker: workerSongData
        });
    }
    // Single worker song array filtering
    const workerSongFilter = new worker_threads_1.Worker(getWorkerPath('songFilter'));
    workers.push({
        id: workerSongFilter.threadId,
        type: 'SongFilter',
        worker: workerSongFilter
    });
}
exports.initWorkers = initWorkers;
function killAllWorkers() {
    workers.forEach((worker) => worker.worker.terminate());
}
exports.killAllWorkers = killAllWorkers;
function getSongFilterWorker() {
    return workers.filter((worker) => worker.type === 'SongFilter')[0].worker;
}
exports.getSongFilterWorker = getSongFilterWorker;
function getSongDataWorkers() {
    return workers.filter((worker) => worker.type === 'SongData').map((worker) => worker.worker);
}
exports.getSongDataWorkers = getSongDataWorkers;
function getWorkerPath(workerName) {
    return path_1.default.join(WORKER_FOLDER_PATH, `${workerName}.worker.js`);
}
