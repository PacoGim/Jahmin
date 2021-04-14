"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkers = exports.initWorkers = void 0;
const worker_threads_1 = require("worker_threads");
const os_1 = require("os");
const TOTAL_CPUS = os_1.cpus().length;
let workers = [];
function initWorkers() {
    const SONG_WORKER_QTY = TOTAL_CPUS - 2 <= 0 ? 1 : TOTAL_CPUS - 2;
    // const SONG_WORKER_QTY = 1
    for (let i = 0; i !== SONG_WORKER_QTY; i++) {
        const worker = new worker_threads_1.Worker('./electron-app/workers/folderScan.worker.js');
        workers.push({
            id: worker.threadId,
            type: 'SongData',
            worker
        });
    }
}
exports.initWorkers = initWorkers;
function getWorkers() {
    return workers;
}
exports.getWorkers = getWorkers;
