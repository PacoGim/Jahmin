"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (data) => {
    let { userSongs, dbSongs } = data;
    let songsToAdd = userSongs
        .filter(song => !dbSongs.includes(song))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
        type: 'songsToAdd',
        songs: songsToAdd
    });
    let songsToDelete = dbSongs.filter(song => !userSongs.includes(song));
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({
        type: 'songsToDelete',
        songs: songsToDelete
    });
});
