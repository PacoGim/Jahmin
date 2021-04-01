"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFolders = exports.getRootDirFolderWatcher = void 0;
const chokidar_1 = require("chokidar");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
let watcher;
function getRootDirFolderWatcher() {
    return watcher;
}
exports.getRootDirFolderWatcher = getRootDirFolderWatcher;
/* ▼▼▼ Folder Related Variables ▼▼▼ */
let folderIndexList = [];
console.log(__1.appDataPath);
let folderIndexPath = path_1.default.join(__1.appDataPath, 'folderIndex.json');
let folderIndexData;
let modifiedFolders = [];
try {
    folderIndexData = JSON.parse(fs_1.default.readFileSync(folderIndexPath, { encoding: 'utf-8' }));
}
catch (error) {
    folderIndexData = [];
}
/* ▲▲▲ Folder Related Variables ▲▲▲ */
function watchFolders(rootDirectories) {
    watcher = chokidar_1.watch(rootDirectories, {
        awaitWriteFinish: true
    });
    // Detect modified folders. A folder is considered modified (mtimeMs changes) if a file has been added or removed.
    watcher.on('addDir', (path, stats) => preStartFolderChangeDetection(path, stats));
    watcher.on('ready', () => {
        fs_1.default.writeFileSync(folderIndexPath, JSON.stringify(folderIndexList), { encoding: 'utf-8' });
        console.log(modifiedFolders);
        console.log('ready');
    });
}
exports.watchFolders = watchFolders;
function preStartFolderChangeDetection(path, stats) {
    if (folderIndexData) {
        let foundDifferentIndexFolder = folderIndexData.find((x) => x.path === path && x.lastModifiedTime !== (stats === null || stats === void 0 ? void 0 : stats.mtimeMs));
        if (foundDifferentIndexFolder) {
            modifiedFolders.push(path);
        }
        folderIndexList.push({
            path,
            lastModifiedTime: stats === null || stats === void 0 ? void 0 : stats.mtimeMs
        });
    }
}
