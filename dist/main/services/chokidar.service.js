"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchPaths = exports.unwatchPaths = exports.getRootDirFolderWatcher = exports.startChokidarWatch = void 0;
const chokidar_1 = require("chokidar");
const isAudioFile_fn_1 = __importDefault(require("../functions/isAudioFile.fn"));
const librarySongs_service_1 = require("./librarySongs.service");
let watcher;
let foundPaths = [];
let ignoredPaths = [];
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
        if (ignoredPaths.indexOf(path) !== -1)
            return;
        if ((0, isAudioFile_fn_1.default)(path)) {
            foundPaths.push(path);
        }
    });
    watcher.on('ready', () => {
        watcher.on('all', (eventName, path) => {
            if (ignoredPaths.indexOf(path) !== -1)
                return;
            if (!(0, isAudioFile_fn_1.default)(path))
                return;
            if (eventName === 'change')
                (0, librarySongs_service_1.addToTaskQueue)(path, 'external-update');
            if (eventName === 'unlink')
                (0, librarySongs_service_1.addToTaskQueue)(path, 'delete');
            if (eventName === 'add')
                (0, librarySongs_service_1.addToTaskQueue)(path, 'insert');
        });
    });
}
exports.startChokidarWatch = startChokidarWatch;
function getRootDirFolderWatcher() {
    return watcher;
}
exports.getRootDirFolderWatcher = getRootDirFolderWatcher;
function unwatchPaths(paths) {
    paths.forEach(path => {
        if (ignoredPaths.indexOf(path) === -1) {
            ignoredPaths.push(path);
        }
    });
}
exports.unwatchPaths = unwatchPaths;
function watchPaths(paths) {
    paths.forEach(path => {
        if (ignoredPaths.indexOf(path) !== -1) {
            ignoredPaths.splice(ignoredPaths.indexOf(path), 1);
        }
    });
}
exports.watchPaths = watchPaths;
