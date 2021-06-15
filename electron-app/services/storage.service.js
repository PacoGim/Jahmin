"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageMap = exports.initStorage = exports.killStorageWatcher = exports.updateStorageVersion = exports.getNewPromiseDbVersion = exports.getStorageMapToArray = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const hashString_fn_1 = require("../functions/hashString.fn");
const worker_service_1 = require("./worker.service");
const STORAGE_PATH = path_1.default.join(__1.appDataPath(), 'storage');
const STORAGE_VERSION_FILE_PATH = path_1.default.join(STORAGE_PATH, 'version');
let storageMap = new Map();
// let storageVersion: number
// Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
let dbVersionResolve = undefined;
let watcher;
let worker = worker_service_1.getWorker('storage');
worker.on('message', (message) => {
    if (message.type === 'Add') {
        addData(message.data);
    }
    else if (message.type === 'Update') {
        updateData(message.data);
    }
});
function updateData(songData) {
    // TODO Logic
}
function addData(songData) {
    let rootDir = songData.SourceFile.split('/').slice(0, -1).join('/');
    let rootId = hashString_fn_1.hash(rootDir, 'text');
    let mappedData = storageMap.get(rootId);
    if (mappedData) {
        mappedData === null || mappedData === void 0 ? void 0 : mappedData.Songs.push(songData);
    }
    else {
        storageMap.set(rootId, {
            ID: rootId,
            RootDir: rootDir,
            Name: songData.Album || '',
            Songs: [songData]
        });
    }
    if (dbVersionResolve !== undefined)
        dbVersionResolve(new Date().getTime());
}
function consolidateStorage() {
    console.log('Consolidating...');
    if (!fs_1.default.existsSync(STORAGE_PATH)) {
        fs_1.default.mkdirSync(STORAGE_PATH);
    }
    let storageFiles = fs_1.default.readdirSync(STORAGE_PATH).filter((file) => {
        if (['.DS_Store', 'version'].includes(file)) {
            return false;
        }
        else {
            return file.indexOf('.tmp-') === -1;
        }
    });
    storageFiles.forEach((file) => {
        let fileData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(STORAGE_PATH, file), { encoding: 'utf-8' }));
        for (let songId in fileData) {
            let song = fileData[songId];
            let rootDir = song.SourceFile.split('/').slice(0, -1).join('/');
            let rootId = hashString_fn_1.hash(rootDir, 'text');
            let data = storageMap.get(rootId);
            if (data) {
                if (!data.Songs.find((i) => i.ID === song.ID)) {
                    data.Songs.push(song);
                    storageMap.set(rootId, data);
                }
            }
            else {
                storageMap.set(rootId, {
                    ID: rootId,
                    RootDir: rootDir,
                    Name: song.Album,
                    Songs: [song]
                });
            }
        }
    });
    // storageMap = map
    // return map
}
function getStorageMapToArray() {
    let map = getStorageMap();
    let array = [];
    map.forEach((album) => {
        array = array.concat(album.Songs);
    });
    return array;
}
exports.getStorageMapToArray = getStorageMapToArray;
function getNewPromiseDbVersion(rendererDbVersion) {
    let dbFileTimeStamp = getStorageVersion();
    // If the db version changed while going back and forth Main <-> Renderer
    if (dbFileTimeStamp > rendererDbVersion) {
        return new Promise((resolve) => resolve(dbFileTimeStamp));
    }
    else {
        // If didn't change, wait for a change to happen.
        return new Promise((resolve) => (dbVersionResolve = resolve));
    }
}
exports.getNewPromiseDbVersion = getNewPromiseDbVersion;
/*
function watchVersionFile() {
    if (!fs.existsSync(STORAGE_VERSION_FILE_PATH)) {
        fs.writeFileSync(STORAGE_VERSION_FILE_PATH, '0')
    }

    watcher = chokidar.watch(path.join(STORAGE_PATH, 'version')).on('change', () => {
        dbVersionResolve(getStorageVersion())
    })
}
*/
function updateStorageVersion() {
    fs_1.default.writeFileSync(STORAGE_VERSION_FILE_PATH, String(new Date().getTime()));
}
exports.updateStorageVersion = updateStorageVersion;
function killStorageWatcher() {
    if (watcher) {
        watcher.close();
    }
}
exports.killStorageWatcher = killStorageWatcher;
function initStorage() {
    consolidateStorage();
    // watchVersionFile()
}
exports.initStorage = initStorage;
function getStorageVersion() {
    try {
        return Number(fs_1.default.readFileSync(path_1.default.join(STORAGE_PATH, 'version'), { encoding: 'utf8' }));
    }
    catch (error) {
        return 0;
    }
}
function getStorageMap() {
    return storageMap;
}
exports.getStorageMap = getStorageMap;
