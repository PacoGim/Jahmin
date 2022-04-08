"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reloadAlbumData = exports.getTaskQueueLength = exports.getMaxTaskQueueLength = exports.getRootDirFolderWatcher = exports.sendSongSyncQueueProgress = exports.watchPaths = exports.unwatchPaths = exports.startChokidarWatch = exports.watchFolders = exports.maxTaskQueueLength = void 0;
const chokidar_1 = require("chokidar");
const os_1 = require("os");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const worker_service_1 = require("./worker.service");
const storage_service_1 = require("./storage.service");
const opus_format_1 = require("../formats/opus.format");
const mp3_format_1 = require("../formats/mp3.format");
const flac_format_1 = require("../formats/flac.format");
const aac_format_1 = require("../formats/aac.format");
const sendWebContents_service_1 = require("./sendWebContents.service");
const TOTAL_CPUS = (0, os_1.cpus)().length;
let watcher;
const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus'];
let storageWorker = (0, worker_service_1.getWorker)('storage');
let isQueueRunning = false;
let taskQueue = [];
exports.maxTaskQueueLength = 0;
let foundPaths = [];
function watchFolders(directories) {
    return __awaiter(this, void 0, void 0, function* () {
        taskQueue = [];
        exports.maxTaskQueueLength = 0;
        let filesInFolders = getAllFilesInFoldersDeep(directories.add);
        let audioFiles = filesInFolders
            .filter(path => isExcludedPaths(path, directories.exclude))
            .filter(file => isAudioFile(file))
            .sort((a, b) => a.localeCompare(b));
        filterSongs(audioFiles);
        // startChokidarWatch(directories.add, directories.exclude)
    });
}
exports.watchFolders = watchFolders;
function isExcludedPaths(path, excludedPaths) {
    let isExcluded = false;
    for (let excludedPath of excludedPaths) {
        if (path.includes(excludedPath)) {
            isExcluded = true;
            break;
        }
    }
    return !isExcluded;
}
function startChokidarWatch(rootDirectories, excludeDirectories = []) {
    if (watcher) {
        watcher.close();
        watcher = undefined;
    }
    watcher = (0, chokidar_1.watch)(rootDirectories, {
        awaitWriteFinish: true,
        ignored: '**/*.DS_Store'
    });
    watcher.unwatch(excludeDirectories);
    watcher.on('add', (path) => {
        foundPaths.push(path);
    });
    watcher.on('ready', () => {
        watcher.on('add', path => {
            if (isAudioFile(path)) {
                addToTaskQueue(path, 'insert');
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
    });
}
exports.startChokidarWatch = startChokidarWatch;
function unwatchPaths(paths) {
    if (watcher) {
        paths.forEach(path => watcher.unwatch(path));
    }
}
exports.unwatchPaths = unwatchPaths;
function watchPaths(paths) {
    if (watcher) {
        paths.forEach(path => watcher.add(path));
    }
}
exports.watchPaths = watchPaths;
// Splits excecution based on the amount of cpus.
function processQueue() {
    // Creates an array with the length from cpus amount and map it to true.
    let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true);
    // For each process, get a task.
    processesRunning.forEach((process, processIndex) => getTask(processIndex));
    // Shifts a task from array and gets the tags.
    function getTask(processIndex) {
        let task = taskQueue.shift();
        // This part works with Storage Worker TS
        if (task !== undefined && ['insert', 'update'].includes(task.type)) {
            getTags(task)
                .then(tags => {
                (0, sendWebContents_service_1.sendWebContents)('web-storage', {
                    type: task.type,
                    data: tags
                });
                /* 			storageWorker?.postMessage({
                    type: task.type,
                    data: tags,
                    appDataPath: appDataPath()
                }) */
                getTask(processIndex);
            })
                .catch(err => {
                getTask(processIndex);
            });
        }
        else if (task !== undefined && ['delete'].includes(task.type)) {
            (0, sendWebContents_service_1.sendWebContents)('web-storage', {
                type: task.type,
                path: task.path
            });
            /* 			storageWorker?.postMessage({
                type: task.type,
                data: task.path,
                appDataPath: appDataPath()
            }) */
            getTask(processIndex);
        }
        else {
            // If no task left then sets its own process as false.
            processesRunning[processIndex] = false;
            // And if the other process is also set to false (so both of them are done), sets isQueueRuning to false so the queue can eventually run again.
            if (processesRunning.every(process => process === false)) {
                isQueueRunning = false;
            }
        }
    }
}
function getTags(task) {
    return new Promise((resolve, reject) => {
        let extension = task.path.split('.').pop().toLowerCase();
        if (extension === 'opus') {
            (0, opus_format_1.getOpusTags)(task.path)
                .then(tags => resolve(tags))
                .catch(err => reject(err));
        }
        else if (extension === 'mp3') {
            (0, mp3_format_1.getMp3Tags)(task.path)
                .then(tags => resolve(tags))
                .catch(err => reject(err));
        }
        else if (extension === 'flac') {
            (0, flac_format_1.getFlacTags)(task.path)
                .then(tags => resolve(tags))
                .catch(err => reject(err));
        }
        else if (extension === 'm4a') {
            (0, aac_format_1.getAacTags)(task.path)
                .then(tags => resolve(tags))
                .catch(err => reject(err));
        }
        else {
            resolve(null);
        }
    });
}
function filterSongs(audioFilesFound = []) {
    return new Promise((resolve, reject) => {
        let worker = (0, worker_service_1.getWorker)('songFilter');
        let collection = (0, storage_service_1.getStorageMapToArray)().map(song => song.SourceFile);
        worker.on('message', (data) => {
            if (data.type === 'songsToAdd') {
                data.songs.forEach(song => process.nextTick(() => addToTaskQueue(song, 'insert')));
            }
            if (data.type === 'songsToDelete') {
                data.songs.forEach(song => process.nextTick(() => addToTaskQueue(song, 'delete')));
                resolve(null);
            }
        });
        worker.postMessage({
            dbSongs: collection,
            userSongs: audioFilesFound
        });
    });
}
function addToTaskQueue(path, type) {
    if (type === 'delete') {
        taskQueue.unshift({
            path: path,
            type: type
        });
    }
    else {
        taskQueue.push({
            type,
            path
        });
    }
    if (taskQueue.length > exports.maxTaskQueueLength) {
        exports.maxTaskQueueLength = taskQueue.length;
    }
    if (isQueueRunning === false) {
        isQueueRunning = true;
        sendSongSyncQueueProgress();
        processQueue();
    }
}
function sendSongSyncQueueProgress() {
    if (taskQueue.length === 0) {
        exports.maxTaskQueueLength = 0;
    }
    (0, sendWebContents_service_1.sendWebContents)('song-sync-queue-progress', {
        currentLength: taskQueue.length,
        maxLength: exports.maxTaskQueueLength
    });
}
exports.sendSongSyncQueueProgress = sendSongSyncQueueProgress;
function getAllFilesInFoldersDeep(rootDirectory) {
    let allFiles = [];
    rootDirectory.forEach(rootDirectory => {
        let files = fs_1.default.readdirSync(rootDirectory);
        files.forEach(file => {
            let filePath = path_1.default.join(rootDirectory, file);
            if (fs_1.default.existsSync(filePath) && fs_1.default.statSync(filePath).isDirectory()) {
                allFiles = allFiles.concat(getAllFilesInFoldersDeep([filePath]));
            }
            else {
                allFiles.push(filePath);
            }
        });
    });
    return allFiles;
}
function isAudioFile(path) {
    return EXTENSIONS.includes(path.split('.').pop() || '');
}
function getRootDirFolderWatcher() {
    return watcher;
}
exports.getRootDirFolderWatcher = getRootDirFolderWatcher;
function getMaxTaskQueueLength() {
    return exports.maxTaskQueueLength;
}
exports.getMaxTaskQueueLength = getMaxTaskQueueLength;
function getTaskQueueLength() {
    return taskQueue.length;
}
exports.getTaskQueueLength = getTaskQueueLength;
function reloadAlbumData(albumId) {
    let album = (0, storage_service_1.getStorageMap)().get(albumId);
    let rootDir = album === null || album === void 0 ? void 0 : album.RootDir;
    if (rootDir === undefined)
        return;
    // Gets all song in folder.
    let rootDirSongs = fs_1.default
        .readdirSync(rootDir)
        .filter(file => isAudioFile(file))
        .map(file => path_1.default.join(rootDir || '', file));
    // Check changes between local songs and DB song by comparing last modified time.
    rootDirSongs.forEach(songPath => {
        let dbSong = album === null || album === void 0 ? void 0 : album.Songs.find(song => song.SourceFile === songPath);
        // If song found in db and local song modified time is bigger than db song.
        if (dbSong && fs_1.default.statSync(dbSong === null || dbSong === void 0 ? void 0 : dbSong.SourceFile).mtimeMs > (dbSong === null || dbSong === void 0 ? void 0 : dbSong.LastModified)) {
            getTags({ path: dbSong.SourceFile })
                .then(tags => {
                (0, sendWebContents_service_1.sendWebContents)('web-storage', {
                    type: 'update',
                    data: tags
                });
                /* 		storageWorker?.postMessage({
                    type: 'update',
                    data: tags,
                    appDataPath: appDataPath()
                }) */
            })
                .catch(err => {
                console.error(err);
            });
        }
    });
}
exports.reloadAlbumData = reloadAlbumData;
