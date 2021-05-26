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
exports.watchFolders = exports.getTotalProcessedChanged = exports.getTotalChangesToProcess = exports.getRootDirFolderWatcher = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const fs_1 = __importDefault(require("fs"));
const string_hash_1 = __importDefault(require("string-hash"));
const observeArray_fn_1 = require("../functions/observeArray.fn");
const aac_format_1 = require("../formats/aac.format");
const flac_format_1 = require("../formats/flac.format");
const mp3_format_1 = require("../formats/mp3.format");
const allowedExtensions = ['flac', 'm4a', 'mp3'];
let watcher;
function getRootDirFolderWatcher() {
    return watcher;
}
exports.getRootDirFolderWatcher = getRootDirFolderWatcher;
// Array to contain to next song to process, controls excessive I/O
let processQueue = [];
let isQueueRunning = false;
let totalChangesToProcess = 0;
let totalProcessedChanged = 0;
function getTotalChangesToProcess() {
    return totalChangesToProcess;
}
exports.getTotalChangesToProcess = getTotalChangesToProcess;
function getTotalProcessedChanged() {
    return totalProcessedChanged;
}
exports.getTotalProcessedChanged = getTotalProcessedChanged;
observeArray_fn_1.observeArray(processQueue, ['push'], () => {
    totalChangesToProcess++;
    if (!isQueueRunning) {
        isQueueRunning = true;
        applyFolderChanges();
    }
});
function applyFolderChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        let changeToApply = processQueue.shift();
        if (changeToApply !== undefined) {
            let { event, path } = changeToApply;
            if (['update', 'add'].includes(event)) {
                let fileToUpdate = yield processedFilePath(path);
                if (fileToUpdate !== undefined) {
                    yield createData(fileToUpdate);
                }
            }
            else if (['delete'].includes(event)) {
                yield deleteData({ SourceFile: path });
            }
            totalProcessedChanged++;
            setImmediate(() => applyFolderChanges());
        }
        else {
            isQueueRunning = false;
        }
    });
}
// Potential issue if a user adds a big folder to scan and then another folder.
// Need to call to function but somehow cancel
function watchFolders(rootDirectories) {
    let foundFiles = [];
    watcher = chokidar_1.default.watch(rootDirectories, {
        awaitWriteFinish: true
    });
    watcher
        .on('change', (path) => {
        var _a;
        let ext = (_a = path.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (ext && allowedExtensions.includes(ext)) {
            processQueue.push({
                event: 'update',
                path
            });
        }
    })
        .on('unlink', (path) => {
        var _a;
        let ext = (_a = path.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (ext && allowedExtensions.includes(ext)) {
            processQueue.push({
                event: 'delete',
                path
            });
        }
    })
        .on('add', (path) => {
        var _a;
        let ext = (_a = path.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (ext && allowedExtensions.includes(ext)) {
            foundFiles.unshift(path);
        }
    })
        .on('ready', () => {
        processFiles(foundFiles);
        // Detects newly added files when app has started.
        watcher.on('add', (path) => {
            var _a;
            let ext = (_a = path.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (ext && allowedExtensions.includes(ext)) {
                processQueue.push({
                    event: 'add',
                    path
                });
            }
        });
    });
}
exports.watchFolders = watchFolders;
function processFiles(files) {
    return __awaiter(this, void 0, void 0, function* () {
        // Gets first element of array.
        let file = files.shift();
        // If no more files to process, then proceed to delete dead files.
        if (file === undefined) {
            console.log('Removing Dead Files');
            removeDeadFiles();
            return;
        }
        processQueue.push({
            event: 'add',
            path: file
        });
        // Gets song metadata if song doesn't exist or was modified.
        // let fileToUpdate = await processedFilePath(file)
        // if (fileToUpdate !== undefined) {
        // 	await createData(fileToUpdate)
        // }
        setTimeout(() => {
            process.nextTick(() => processFiles(files));
        }, 1);
    });
}
function processedFilePath(filePath) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const id = string_hash_1.default(filePath);
        const extension = filePath.split('.').pop() || '';
        const fileStats = fs_1.default.statSync(filePath);
        let isFileModified = false;
        let dbDoc = readData({ ID: id });
        if (dbDoc) {
            if (fileStats.mtimeMs !== dbDoc['LastModified']) {
                isFileModified = true;
            }
        }
        if (dbDoc === undefined || isFileModified === true) {
            if (extension === 'm4a') {
                resolve(yield aac_format_1.getAacTags(filePath));
            }
            if (extension === 'flac') {
                resolve(yield flac_format_1.getFlacTags(filePath));
            }
            if (extension === 'mp3') {
                resolve(yield mp3_format_1.getMp3Tags(filePath));
            }
            // resolve(await getFileMetatag(filePath, id, extension, fileStats))
        }
        else {
            resolve(undefined);
        }
    }));
}
function removeDeadFiles() {
    let collection = getCollection();
    collection.forEach((song) => {
        if (!fs_1.default.existsSync(song['SourceFile'])) {
            console.log('Delete:', song['SourceFile']);
            deleteData({ SourceFile: song['SourceFile'] });
        }
    });
}
