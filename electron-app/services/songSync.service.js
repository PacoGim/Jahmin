"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFolders = exports.getTaskQueueLength = exports.getMaxTaskQueueLength = exports.maxTaskQueueLength = exports.getRootDirFolderWatcher = void 0;
const chokidar_1 = require("chokidar");
const os_1 = require("os");
const worker_service_1 = require("./worker.service");
const __1 = require("..");
const storage_service_1 = require("./storage.service");
const opus_format_1 = require("../formats/opus.format");
const mp3_format_1 = require("../formats/mp3.format");
const flac_format_1 = require("../formats/flac.format");
const aac_format_1 = require("../formats/aac.format");
const TOTAL_CPUS = os_1.cpus().length;
let watcher;
const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus'];
function getRootDirFolderWatcher() {
    return watcher;
}
exports.getRootDirFolderWatcher = getRootDirFolderWatcher;
// export let taskQueue: any[] = []
let isQueueRunning = false;
let storageWorker = worker_service_1.getWorker('storage');
let taskQueue = [];
// Splits excecution based on the amount of cpus.
function processQueue() {
    // Creates an array with the length from cpus amount and map it to true.
    let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true);
    // For each process, get a task.
    processesRunning.forEach((process, processIndex) => getTask(processIndex));
    // Shifts a task from array and gets the tags.
    function getTask(processIndex) {
        let task = taskQueue.shift();
        // This part goes to Storage Worker TS
        if (task !== undefined && ['insert', 'update'].includes(task.type)) {
            getTags(task).then((tags) => {
                storageWorker === null || storageWorker === void 0 ? void 0 : storageWorker.postMessage({
                    type: task.type,
                    data: tags,
                    appDataPath: __1.appDataPath()
                });
                getTask(processIndex);
            });
        }
        else if (task !== undefined && ['delete'].includes(task.type)) {
            storageWorker === null || storageWorker === void 0 ? void 0 : storageWorker.postMessage({
                type: task.type,
                data: task.path,
                appDataPath: __1.appDataPath()
            });
            getTask(processIndex);
        }
        else {
            // If no task left then sets its own process as false.
            processesRunning[processIndex] = false;
            // And if the other process is also set to false (so both of them are done), sets isQueueRuning to false so the queue can eventually run again.
            if (processesRunning.every((process) => process === false)) {
                isQueueRunning = false;
            }
        }
    }
}
function getTags(task) {
    return new Promise((resolve, reject) => {
        let extension = task.path.split('.').pop().toLowerCase();
        if (extension === 'opus') {
            opus_format_1.getOpusTags(task.path).then((tags) => resolve(tags));
        }
        else if (extension === 'mp3') {
            mp3_format_1.getMp3Tags(task.path).then((tags) => resolve(tags));
        }
        else if (extension === 'flac') {
            flac_format_1.getFlacTags(task.path).then((tags) => resolve(tags));
        }
        else if (extension === 'm4a') {
            aac_format_1.getAacTags(task.path).then((tags) => resolve(tags));
        }
        else {
            resolve('');
        }
    });
}
let songsFound = [];
exports.maxTaskQueueLength = 0;
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
            songsFound.push(path);
        }
    });
    watcher.on('change', (path) => {
        if (isAudioFile(path)) {
            addToTaskQueue(path, 'update');
        }
    });
    watcher.on('unlink', (path) => {
        if (isAudioFile(path)) {
            addToTaskQueue(path, 'delete');
        }
    });
    // watcher.on('all', (event, path) => {
    // 	console.log(event, path)
    // })
    watcher.on('ready', () => {
        // When watcher is done getting files, any new files added afterwards are detected here.
        watcher.on('add', (path) => addToTaskQueue(path, 'insert'));
        filterNewSongs();
    });
}
exports.watchFolders = watchFolders;
function filterNewSongs() {
    return new Promise((resolve, reject) => {
        let worker = worker_service_1.getWorker('songFilter');
        let collection = storage_service_1.getStorageMapToArray().map((song) => song.SourceFile);
        worker.on('message', (data) => {
            data.forEach((songPath) => process.nextTick(() => addToTaskQueue(songPath, 'insert')));
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
    if (isQueueRunning === false) {
        processQueue();
    }
}
function isAudioFile(path) {
    return EXTENSIONS.includes(path.split('.').pop() || '');
}
