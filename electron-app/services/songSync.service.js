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
exports.reloadAlbumData = exports.getTaskQueueLength = exports.getMaxTaskQueueLength = exports.getRootDirFolderWatcher = exports.watchPaths = exports.unwatchPaths = exports.sendSongSyncQueueProgress = exports.addToTaskQueue = exports.startChokidarWatch = exports.watchFolders = exports.maxTaskQueueLength = void 0;
const chokidar_1 = require("chokidar");
const os_1 = require("os");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const worker_service_1 = require("./worker.service");
const storage_service_1 = require("./storage.service");
const sendWebContents_service_1 = require("./sendWebContents.service");
const config_service_1 = require("./config.service");
const sortByOrder_fn_1 = __importDefault(require("../functions/sortByOrder.fn"));
const getSongTags_fn_1 = __importDefault(require("../functions/getSongTags.fn"));
const updateSongTags_fn_1 = __importDefault(require("../functions/updateSongTags.fn"));
const TOTAL_CPUS = (0, os_1.cpus)().length;
let watcher;
const EXTENSIONS = ['flac', 'm4a', 'mp3', 'opus'];
let isQueueRunning = false;
let taskQueue = [];
exports.maxTaskQueueLength = 0;
let foundPaths = [];
function watchFolders(dbSongs) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = (0, config_service_1.getConfig)();
        if ((config === null || config === void 0 ? void 0 : config.directories) === undefined) {
            return;
        }
        isQueueRunning = false;
        taskQueue = [];
        exports.maxTaskQueueLength = 0;
        let filesInFolders = getAllFilesInFoldersDeep(config.directories.add);
        let audioFiles = filesInFolders
            .filter(path => isExcludedPaths(path, config.directories.exclude))
            .filter(file => isAudioFile(file))
            .sort((a, b) => a.localeCompare(b));
        filterSongs(audioFiles, dbSongs);
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
// Splits excecution based on the amount of cpus.
function processQueue() {
    // Creates an array with the length from cpus amount and map it to true.
    let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true);
    // For each process, get a task.
    processesRunning.forEach((process, processIndex) => getTask(processIndex));
    // Shifts a task from array and gets the tags.
    function getTask(processIndex) {
        let task = taskQueue.shift();
        if (task === undefined) {
            // If no task left then sets its own process as false.
            processesRunning[processIndex] = false;
            // And if the other process is also set to false (so both of them are done), sets isQueueRuning to false so the queue can eventually run again.
            if (processesRunning.every(process => process === false)) {
                isQueueRunning = false;
            }
            return;
        }
        if (task.type === 'insert') {
            (0, getSongTags_fn_1.default)(task.path)
                .then(tags => {
                (0, sendWebContents_service_1.sendWebContents)('web-storage', {
                    type: 'insert',
                    data: tags
                });
            })
                .catch()
                .finally(() => getTask(processIndex));
        }
        else if (task.type === 'update') {
            let newTags = undefined;
            if (task.data !== undefined) {
                newTags = task.data;
            }
            else {
                (0, getSongTags_fn_1.default)(task.path)
                    .then(tags => {
                    newTags = tags;
                })
                    .catch();
            }
            (0, updateSongTags_fn_1.default)(task.path, newTags)
                .then(result => {
                // Result can be 0 | 1 | -1
                // -1 means error.
                if (result === -1) {
                    (0, sendWebContents_service_1.sendWebContents)('web-storage', {
                        type: 'update',
                        data: undefined
                    });
                }
                else {
                    (0, sendWebContents_service_1.sendWebContents)('web-storage', {
                        type: 'update',
                        data: newTags
                    });
                }
            })
                .catch()
                .finally(() => getTask(processIndex));
        }
        else if (task.type === 'delete') {
            (0, sendWebContents_service_1.sendWebContents)('web-storage', {
                type: 'delete',
                data: task.path
            });
            getTask(processIndex);
        }
    }
}
function addToTaskQueue(path, type, data = undefined) {
    taskQueue.push({
        type,
        path,
        data
    });
    taskQueue = (0, sortByOrder_fn_1.default)(taskQueue, 'type', ['delete', 'update', 'insert']);
    if (taskQueue.length > exports.maxTaskQueueLength) {
        exports.maxTaskQueueLength = taskQueue.length;
    }
    if (isQueueRunning === false) {
        isQueueRunning = true;
        sendSongSyncQueueProgress();
        processQueue();
    }
}
exports.addToTaskQueue = addToTaskQueue;
function updateSong() { }
function sendSongSyncQueueProgress() {
    if (taskQueue.length === 0) {
        exports.maxTaskQueueLength = 0;
    }
    (0, sendWebContents_service_1.sendWebContents)('song-sync-queue-progress', {
        currentLength: taskQueue.length,
        maxLength: exports.maxTaskQueueLength
    });
    if (!(taskQueue.length === 0 && exports.maxTaskQueueLength === 0)) {
        setTimeout(() => {
            sendSongSyncQueueProgress();
        }, 1000);
    }
}
exports.sendSongSyncQueueProgress = sendSongSyncQueueProgress;
function filterSongs(audioFilesFound = [], dbSongs) {
    return new Promise((resolve, reject) => {
        let worker = (0, worker_service_1.getWorker)('songFilter');
        worker.on('message', (data) => {
            if (data.type === 'songsToAdd') {
                data.songs.forEach(songPath => process.nextTick(() => addToTaskQueue(songPath, 'insert')));
            }
            if (data.type === 'songsToDelete') {
                if (data.songs.length > 0) {
                    (0, sendWebContents_service_1.sendWebContents)('web-storage-bulk-delete', data.songs);
                }
            }
        });
        worker.postMessage({
            dbSongs,
            userSongs: audioFilesFound
        });
    });
}
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
            (0, getSongTags_fn_1.default)(dbSong.SourceFile)
                .then(tags => {
                (0, sendWebContents_service_1.sendWebContents)('web-storage', {
                    type: 'update',
                    data: tags
                });
            })
                .catch(err => {
                console.error(err);
            });
        }
    });
}
exports.reloadAlbumData = reloadAlbumData;
