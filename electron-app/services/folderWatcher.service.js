"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFolders = exports.getTaskQueueLength = exports.getMaxTaskQueueLength = exports.maxTaskQueueLength = exports.taskQueue = exports.getRootDirFolderWatcher = void 0;
const chokidar_1 = require("chokidar");
const loki_service_1 = require("./loki.service");
const worker_service_1 = require("./worker.service");
let watcher;
const EXTENSIONS = ['flac', 'm4a', 'mp3'];
function getRootDirFolderWatcher() {
    return watcher;
}
exports.getRootDirFolderWatcher = getRootDirFolderWatcher;
exports.taskQueue = [];
let filesFound = [];
exports.maxTaskQueueLength = 0;
let workerSongData = worker_service_1.getSongDataWorkers();
function getMaxTaskQueueLength() {
    return exports.maxTaskQueueLength;
}
exports.getMaxTaskQueueLength = getMaxTaskQueueLength;
function getTaskQueueLength() {
    return exports.taskQueue.length;
}
exports.getTaskQueueLength = getTaskQueueLength;
function watchFolders(rootDirectories) {
    watcher = chokidar_1.watch(rootDirectories, {
        awaitWriteFinish: true
    });
    watcher.on('add', (path) => preAppStartFileDetection(path));
    watcher.on('ready', () => {
        watcher.on('add', (path) => addToTaskQueue(path, 'add'));
        checkNewSongs();
        startWorkers();
        console.log('ready');
    });
}
exports.watchFolders = watchFolders;
function startWorkers() {
    workerSongData.forEach((worker, index) => {
        setTimeout(() => {
            // console.log(index, 10000 * index)
            worker.on('message', (options) => {
                if (options.task === 'Not Tasks Left') {
                    setTimeout(() => {
                        processQueue(worker);
                    }, 2000);
                }
                else if (options.task === 'Get Song Data') {
                    loki_service_1.createData(options.data).then(() => {
                        processQueue(worker);
                    });
                }
            });
            processQueue(worker);
        }, 10000 * index);
    });
}
function processQueue(worker) {
    let task = exports.taskQueue.shift();
    if (task) {
        if (exports.taskQueue.length > exports.maxTaskQueueLength) {
            exports.maxTaskQueueLength = exports.taskQueue.length;
        }
        let { type, path } = task;
        if (type === 'add') {
            worker.postMessage({
                task: 'Get Song Data',
                data: {
                    path
                }
            });
        }
    }
    else {
        worker.postMessage({
            task: 'Not Tasks Left'
        });
    }
}
function checkNewSongs() {
    let collection = loki_service_1.getCollection().map((song) => song.SourceFile);
    let worker = worker_service_1.getSongFilterWorker();
    worker.on('message', (data) => {
        data.forEach((songPath) => process.nextTick(() => addToTaskQueue(songPath, 'add')));
    });
    worker.postMessage({
        dbSongs: collection,
        foundSongs: filesFound
    });
}
function addToTaskQueue(path, type) {
    exports.taskQueue.push({
        type,
        path
    });
}
function preAppStartFileDetection(path) {
    if (isAudioFile(path)) {
        filesFound.unshift(path);
    }
}
function isAudioFile(path) {
    return EXTENSIONS.includes(path.split('.').pop() || '');
}
