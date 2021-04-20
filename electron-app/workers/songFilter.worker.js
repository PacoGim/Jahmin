"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', (data) => {
    let { foundSongs, dbSongs } = data;
    let newSongs = [];
    foundSongs.forEach((song) => {
        if (dbSongs.indexOf(song) === -1) {
            newSongs.push(song);
        }
    });
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(newSongs);
});
