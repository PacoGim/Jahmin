"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFolders = exports.getTaskQueueLength = exports.getMaxTaskQueueLength = exports.maxTaskQueueLength = exports.taskQueue = exports.getRootDirFolderWatcher = void 0;
const chokidar_1 = require("chokidar");
const loki_service_1 = require("./loki.service");
const worker_threads_1 = require("worker_threads");
let watcher;
const EXTENSIONS = ['flac', 'm4a', 'mp3'];
function getRootDirFolderWatcher() {
    return watcher;
}
exports.getRootDirFolderWatcher = getRootDirFolderWatcher;
exports.taskQueue = [];
let filesFound = [];
exports.maxTaskQueueLength = 0;
let watchTaskQueueInterval;
const worker = new worker_threads_1.Worker('./electron-app/workers/folderScan.worker.js');
worker.on('message', (songData) => {
    loki_service_1.createData(songData).then(() => processTaskQueue());
});
function processTaskQueue() {
    let task = exports.taskQueue.shift();
    // console.log(maxTaskQueueLength, taskQueue.length, (100 / maxTaskQueueLength) * taskQueue.length)
    if (task) {
        clearInterval(watchTaskQueueInterval);
        if (exports.taskQueue.length > exports.maxTaskQueueLength) {
            exports.maxTaskQueueLength = exports.taskQueue.length;
        }
        let { type, path } = task;
        if (type === 'add') {
            worker.postMessage(path);
        }
    }
    else {
        clearInterval(watchTaskQueueInterval);
        watchTaskQueueInterval = setInterval(() => processTaskQueue(), 2000);
    }
}
function getMaxTaskQueueLength() {
    return exports.maxTaskQueueLength;
}
exports.getMaxTaskQueueLength = getMaxTaskQueueLength;
function getTaskQueueLength() {
    return exports.taskQueue.length;
}
exports.getTaskQueueLength = getTaskQueueLength;
// function getSongTags(path: string): Promise<SongType> {
// 	return new Promise((resolve, reject) => {
// 		let extension = path.split('.').pop() || undefined
// 		if (extension === 'm4a') {
// 			getAacTags(path).then((data) => resolve(data))
// 		} else if (extension === 'flac') {
// 			getFlacTags(path).then((data) => resolve(data))
// 		} else if (extension === 'mp3') {
// 			getMp3Tags(path).then((data) => resolve(data))
// 		}
// 	})
// }
function watchFolders(rootDirectories) {
    watcher = chokidar_1.watch(rootDirectories, {
        awaitWriteFinish: true
    });
    watcher.on('add', (path) => preAppStartFileDetection(path));
    watcher.on('ready', () => {
        watcher.on('add', (path) => addToTaskQueue(path, 'add'));
        checkNewSongs();
        watchTaskQueueInterval = setInterval(() => processTaskQueue(), 2000);
        console.log('ready');
    });
}
exports.watchFolders = watchFolders;
function checkNewSongs() {
    let collection = loki_service_1.getCollection().map((song) => song.SourceFile);
    filterOutOldSongs(collection);
}
function filterOutOldSongs(collection) {
    let file = filesFound.shift();
    if (file) {
        if (collection.indexOf(file) === -1) {
            addToTaskQueue(file, 'add');
        }
        process.nextTick(() => filterOutOldSongs(collection));
        // setTimeout(() => {
        // }, 1)
    }
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
