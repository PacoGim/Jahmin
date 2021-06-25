"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFolders = exports.getTaskQueueLength = exports.getMaxTaskQueueLength = exports.maxTaskQueueLength = exports.getRootDirFolderWatcher = void 0;
const chokidar_1 = require("chokidar");
const worker_service_1 = require("./worker.service");
const storage_service_1 = require("./storage.service");
const opus_format_1 = require("../formats/opus.format");
let watcher;
const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus'];
function getRootDirFolderWatcher() {
    return watcher;
}
exports.getRootDirFolderWatcher = getRootDirFolderWatcher;
// export let taskQueue: any[] = []
let isQueueRunning = false;
let count = 0;
let workerExec = worker_service_1.getWorker('nodeExec');
let taskQueue = new Proxy([], {
    get(target, fn) {
        if (fn === 'length' && target.length !== 0 && isQueueRunning === false) {
            isQueueRunning = true;
            setTimeout(() => {
                processQueue();
            }, 1000);
        }
        return target[fn];
    }
});
function processQueue() {
    console.log(taskQueue.length, isQueueRunning);
    let task = taskQueue.shift();
    let task2 = taskQueue.shift();
    if (task === undefined && task2 === undefined) {
        isQueueRunning = false;
        return;
    }
    if (task)
        getTags(task);
    if (task2)
        getTags(task2);
}
function getTags(task) {
    let extension = task.path.split('.').pop().toLowerCase();
    if (extension === 'opus') {
        opus_format_1.getOpusTags(task.path).then((tags) => {
            //TODO Save to DB
            processQueue();
        });
    }
    else {
        processQueue();
    }
}
let songsFound = [];
exports.maxTaskQueueLength = 0;
// let workerSongData = getWorker('')
let storageWorker = worker_service_1.getWorker('storage');
function getMaxTaskQueueLength() {
    return exports.maxTaskQueueLength;
}
exports.getMaxTaskQueueLength = getMaxTaskQueueLength;
function getTaskQueueLength() {
    return taskQueue.length;
}
exports.getTaskQueueLength = getTaskQueueLength;
function watchFolders(rootDirectories) {
    watcher = chokidar_1.watch(rootDirectories, {
        awaitWriteFinish: true,
        ignored: '**/*.DS_Store'
    });
    watcher.on('add', (path) => {
        // For every file found, check if is a available audio format and add to list.
        if (isAudioFile(path)) {
            // Uses unshift instead of push to add to the beginning of the array since chokidar brings folders in reverse order.
            songsFound.push(path);
        }
    });
    watcher.on('change', (path) => {
        // TODO Storage fn
        // console.log('Changed: ',path)
    });
    watcher.on('unlink', (path) => {
        // TODO Storage fn
    });
    // watcher.on('all', (event, path) => {
    // 	console.log(event, path)
    // })
    watcher.on('ready', () => {
        // When watcher is done getting files, any new files added afterwards are detected here.
        watcher.on('add', (path) => addToTaskQueue(path, 'add'));
        filterNewSongs(); /*.then(() => {
            addNewSongs()
        })*/
        // startWorkers()
        console.log('ready');
    });
}
exports.watchFolders = watchFolders;
let nodeExecWorker = worker_service_1.getWorker('nodeExec');
function filterNewSongs() {
    return new Promise((resolve, reject) => {
        let worker = worker_service_1.getWorker('songFilter');
        let collection = storage_service_1.getStorageMapToArray().map((song) => song.SourceFile);
        worker.on('message', (data) => {
            data.forEach((songPath) => process.nextTick(() => addToTaskQueue(songPath, 'add')));
            worker_service_1.killWorker('songFilter');
            resolve(null);
        });
        worker.postMessage({
            dbSongs: collection,
            foundSongs: songsFound
        });
    });
}
function addToTaskQueue(path, type) {
    taskQueue.push({
        type,
        path
    });
}
function isAudioFile(path) {
    return EXTENSIONS.includes(path.split('.').pop() || '');
}
