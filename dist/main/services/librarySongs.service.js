"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reloadAlbumData = exports.getTaskQueueLength = exports.getMaxTaskQueueLength = exports.stopSongsUpdating = exports.sendSongSyncQueueProgress = exports.addToTaskQueue = exports.fetchSongsTag = exports.maxTaskQueueLength = void 0;
const os_1 = require("os");
/********************** Services **********************/
const workers_service_1 = require("./workers.service");
const config_service_1 = require("./config.service");
const chokidar_service_1 = require("./chokidar.service");
/********************** Functions **********************/
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const sortByOrder_fn_1 = __importDefault(require("../functions/sortByOrder.fn"));
const getSongTags_fn_1 = __importDefault(require("../functions/getSongTags.fn"));
const updateSongTags_fn_1 = __importDefault(require("../functions/updateSongTags.fn"));
const hashString_fn_1 = __importDefault(require("../functions/hashString.fn"));
const isExcludedPaths_fn_1 = __importDefault(require("../functions/isExcludedPaths.fn"));
const removeDuplicateObjectsFromArray_fn_1 = __importDefault(require("../functions/removeDuplicateObjectsFromArray.fn"));
const getAllFilesInFoldersDeep_fn_1 = __importDefault(require("../functions/getAllFilesInFoldersDeep.fn"));
const isAudioFile_fn_1 = __importDefault(require("../functions/isAudioFile.fn"));
const TOTAL_CPUS = (0, os_1.cpus)().length;
let isQueueRunning = false;
let taskQueue = [];
exports.maxTaskQueueLength = 0;
async function fetchSongsTag(dbSongs) {
    const config = (0, config_service_1.getConfig)();
    if (config?.directories === undefined) {
        return;
    }
    isQueueRunning = false;
    taskQueue = [];
    exports.maxTaskQueueLength = 0;
    let filesInFolders = (0, getAllFilesInFoldersDeep_fn_1.default)(config.directories.add);
    let audioFiles = filesInFolders
        .filter(path => (0, isExcludedPaths_fn_1.default)(path, config.directories.exclude))
        .filter(file => (0, isAudioFile_fn_1.default)(file))
        .sort((a, b) => a.localeCompare(b));
    filterSongs(audioFiles, dbSongs);
    (0, chokidar_service_1.startChokidarWatch)(config.directories.add, config.directories.exclude);
}
exports.fetchSongsTag = fetchSongsTag;
// Splits excecution based on the amount of cpus.
function processQueue() {
    // Creates an array with the length from cpus amount and map it to true.
    let processesRunning = Array.from(Array(TOTAL_CPUS >= 3 ? 2 : 1).keys()).map(() => true);
    // For each process, get a task.
    processesRunning.forEach((process, processIndex) => getTask(processIndex, processesRunning));
}
// Shifts a task from array and gets the tags.
function getTask(processIndex, processesRunning) {
    taskQueue = (0, removeDuplicateObjectsFromArray_fn_1.default)(taskQueue);
    taskQueue = (0, sortByOrder_fn_1.default)(taskQueue, 'type', ['delete', 'update', 'insert', 'external-update']);
    if (taskQueue.length > exports.maxTaskQueueLength) {
        exports.maxTaskQueueLength = taskQueue.length;
    }
    let task = taskQueue.shift();
    if (task === undefined) {
        // If no task left then sets its own process as false.
        processesRunning[processIndex] = false;
        // And if the other process is also set to false (so both of them are done), sets isQueueRuning to false so the queue can eventually run again.
        if (processesRunning.every((process) => process === false)) {
            isQueueRunning = false;
        }
        return;
    }
    if (task.type === 'insert') {
        (0, getSongTags_fn_1.default)(task.path)
            .then(tags => {
            (0, sendWebContents_fn_1.default)('web-storage', {
                type: 'insert',
                data: tags
            });
        })
            .catch()
            .finally(() => getTask(processIndex, processesRunning));
    }
    else if (task.type === 'update') {
        handleUpdateTask(task, processIndex, processesRunning);
    }
    else if (task.type === 'external-update') {
        handleExternalUpdateTask(task, processIndex, processesRunning);
    }
    else if (task.type === 'delete') {
        (0, sendWebContents_fn_1.default)('web-storage', {
            type: 'delete',
            data: (0, hashString_fn_1.default)(task.path, 'number')
        });
        getTask(processIndex, processesRunning);
    }
}
async function handleUpdateTask(task, processIndex, processesRunning) {
    let newTags = undefined;
    if (task.data !== undefined) {
        newTags = task.data;
    }
    else {
        newTags = await (0, getSongTags_fn_1.default)(task.path).catch();
        console.log('newTags', newTags);
    }
    (0, updateSongTags_fn_1.default)(task.path, { ...newTags })
        .then(result => {
        // Result can be 0 | 1 | -1
        // -1 means error.
        if (result === -1) {
            (0, sendWebContents_fn_1.default)('web-storage', {
                type: task.type,
                data: undefined
            });
        }
        else {
            // Removes Mp3 Popularimeter (Rating) tag.
            if (newTags?.popularimeter) {
                delete newTags.popularimeter;
            }
            (0, sendWebContents_fn_1.default)('web-storage', {
                type: task.type,
                data: {
                    id: (0, hashString_fn_1.default)(task.path, 'number'),
                    newTags
                }
            });
        }
    })
        .catch()
        .finally(() => {
        setTimeout(() => {
            (0, chokidar_service_1.watchPaths)([task.path]);
        }, 1);
        getTask(processIndex, processesRunning);
    });
}
async function handleExternalUpdateTask(task, processIndex, processesRunning) {
    let newTags = undefined;
    newTags = await (0, getSongTags_fn_1.default)(task.path).catch();
    (0, sendWebContents_fn_1.default)('web-storage', {
        type: task.type,
        data: {
            id: (0, hashString_fn_1.default)(task.path, 'number'),
            newTags
        }
    });
    getTask(processIndex, processesRunning);
}
function addToTaskQueue(path, type, data = undefined) {
    let newTask = {
        type,
        path,
        data
    };
    taskQueue.push(newTask);
    if (isQueueRunning === false) {
        isQueueRunning = true;
        sendSongSyncQueueProgress();
        processQueue();
    }
}
exports.addToTaskQueue = addToTaskQueue;
function sendSongSyncQueueProgress() {
    if (taskQueue.length === 0) {
        exports.maxTaskQueueLength = 0;
    }
    (0, sendWebContents_fn_1.default)('song-sync-queue-progress', {
        isSongUpdating: taskQueue.find(task => task.type === 'update') !== undefined,
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
function stopSongsUpdating() {
    return new Promise(resolve => {
        taskQueue = taskQueue.filter(task => task.type !== 'update');
        resolve(null);
    });
}
exports.stopSongsUpdating = stopSongsUpdating;
function filterSongs(audioFilesFound = [], dbSongs) {
    return new Promise(async (resolve, reject) => {
        let worker = (await (0, workers_service_1.getWorker)('songFilter'));
        worker.on('message', (data) => {
            if (data.type === 'songsToAdd') {
                data.songs.forEach(songPath => process.nextTick(() => addToTaskQueue(songPath, 'insert')));
            }
            if (data.type === 'songsToDelete') {
                if (data.songs.length > 0) {
                    (0, sendWebContents_fn_1.default)('web-storage-bulk-delete', data.songs);
                }
            }
        });
        worker.postMessage({
            dbSongs,
            userSongs: audioFilesFound
        });
    });
}
function getMaxTaskQueueLength() {
    return exports.maxTaskQueueLength;
}
exports.getMaxTaskQueueLength = getMaxTaskQueueLength;
function getTaskQueueLength() {
    return taskQueue.length;
}
exports.getTaskQueueLength = getTaskQueueLength;
function reloadAlbumData(albumId) {
    /*
    let album = getStorageMap().get(albumId)
    let rootDir = album?.RootDir

    if (rootDir === undefined) return

    // Gets all song in folder.
    let rootDirSongs = fs
        .readdirSync(rootDir)
        .filter(file => isAudioFile(file))
        .map(file => path.join(rootDir || '', file))

    // Check changes between local songs and DB song by comparing last modified time.
    rootDirSongs.forEach(songPath => {
        let dbSong = album?.Songs.find(song => song.SourceFile === songPath)

        // If song found in db and local song modified time is bigger than db song.
        if (dbSong && fs.statSync(dbSong?.SourceFile).mtimeMs > dbSong?.LastModified!) {
            getSongTagsFn(dbSong.SourceFile)
                .then(tags => {
                    sendWebContentsFn('web-storage', {
                        type: 'update',
                        data: tags
                    })
                })
                .catch(err => {
                    console.error(err)
                })
        }
    })
    */
}
exports.reloadAlbumData = reloadAlbumData;
