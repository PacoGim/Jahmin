"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageMap = exports.initStorage = exports.killStorageWatcher = exports.getNewPromiseDbVersion = exports.getStorageMapToArray = exports.getFuzzyList = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const hashString_fn_1 = require("../functions/hashString.fn");
const worker_service_1 = require("./worker.service");
const generateId_fn_1 = __importDefault(require("../functions/generateId.fn"));
const STORAGE_PATH = path_1.default.join((0, __1.appDataPath)(), 'storage');
const STORAGE_VERSION_FILE_PATH = path_1.default.join(STORAGE_PATH, 'version');
let storageMap = new Map();
// let storageVersion: number
// Deferred Promise, when set (from anywhere), will resolve getNewPromiseDbVersion
let dbVersionResolve = undefined;
let watcher;
let worker = (0, worker_service_1.getWorker)('storage');
worker === null || worker === void 0 ? void 0 : worker.on('message', message => {
    if (message.type === 'insert') {
        insertData(message.data);
    }
    else if (message.type === 'update') {
        updateData(message.data);
    }
    else if (message.type === 'delete') {
        deleteData(message.data);
    }
    else if (message.type === 'deleteFolder') {
        deleteFolder(message.data);
    }
    updateStorageVersion();
});
function deleteFolder(rootDir) {
    let rootId = (0, hashString_fn_1.hash)(rootDir, 'text');
    let mappedData = storageMap.get(rootId);
    if (mappedData) {
        storageMap.delete(rootId);
        if (dbVersionResolve !== undefined)
            dbVersionResolve((0, generateId_fn_1.default)());
    }
}
function deleteData(songPath) {
    let rootDir = songPath.split('/').slice(0, -1).join('/');
    let rootId = (0, hashString_fn_1.hash)(rootDir, 'text');
    let songId = (0, hashString_fn_1.hash)(songPath, 'number');
    let mappedData = storageMap.get(rootId);
    let songs = mappedData === null || mappedData === void 0 ? void 0 : mappedData.Songs;
    if (mappedData && songs) {
        songs = songs.filter(song => song.ID !== songId);
        mappedData.Songs = songs;
        storageMap.set(rootDir, mappedData);
        // If all songs removed from drive, then, delete the album and all data from map.
        if (songs.length === 0) {
            storageMap.delete(rootDir);
        }
        if (dbVersionResolve !== undefined)
            dbVersionResolve((0, generateId_fn_1.default)());
    }
}
function updateData(songData) {
    if ((songData === null || songData === void 0 ? void 0 : songData.SourceFile) === undefined) {
        return;
    }
    let rootDir = songData.SourceFile.split('/').slice(0, -1).join('/');
    let rootId = (0, hashString_fn_1.hash)(rootDir, 'text');
    let songId = (0, hashString_fn_1.hash)(songData.SourceFile, 'number');
    let mappedData = storageMap.get(rootId);
    let songs = mappedData === null || mappedData === void 0 ? void 0 : mappedData.Songs;
    if (mappedData && songs) {
        let songIndex = songs.findIndex(song => song.ID === songId);
        songs[songIndex] = songData;
        mappedData.Songs = songs;
        storageMap.set(rootDir, mappedData);
        if (dbVersionResolve !== undefined)
            dbVersionResolve((0, generateId_fn_1.default)());
    }
}
function insertData(songData) {
    if (songData === undefined) {
        return;
    }
    let rootDir = songData.SourceFile.split('/').slice(0, -1).join('/');
    let rootId = (0, hashString_fn_1.hash)(rootDir, 'text');
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
        dbVersionResolve((0, generateId_fn_1.default)());
}
let fuzzyArray = [];
function consolidateStorage() {
    if (!fs_1.default.existsSync(STORAGE_PATH)) {
        fs_1.default.mkdirSync(STORAGE_PATH);
    }
    let storageFiles = fs_1.default.readdirSync(STORAGE_PATH).filter(file => {
        if (['.DS_Store', 'version'].includes(file)) {
            return false;
        }
        else {
            return file.indexOf('.tmp-') === -1;
        }
    });
    storageFiles.forEach(file => {
        let fileData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(STORAGE_PATH, file), { encoding: 'utf-8' }));
        for (let songId in fileData) {
            let song = fileData[songId];
            let rootDir = song.SourceFile.split('/').slice(0, -1).join('/');
            let rootId = (0, hashString_fn_1.hash)(rootDir, 'text');
            let data = storageMap.get(rootId);
            if (data) {
                if (!data.Songs.find(i => i.ID === song.ID)) {
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
}
function getFuzzyList() {
    return fuzzyArray;
}
exports.getFuzzyList = getFuzzyList;
function getStorageMapToArray() {
    let map = getStorageMap();
    let array = [];
    map.forEach(album => {
        array = array.concat(album.Songs);
    });
    return array;
}
exports.getStorageMapToArray = getStorageMapToArray;
function getNewPromiseDbVersion(rendererDbVersion) {
    let dbFileTimeStamp = getStorageVersion();
    // If the db version changed while going back and forth Main <-> Renderer
    if (rendererDbVersion !== dbFileTimeStamp) {
        return new Promise(resolve => resolve(dbFileTimeStamp));
    }
    else {
        // If didn't change, wait for a change to happen.
        return new Promise(resolve => (dbVersionResolve = resolve));
    }
}
exports.getNewPromiseDbVersion = getNewPromiseDbVersion;
function updateStorageVersion() {
    fs_1.default.writeFileSync(STORAGE_VERSION_FILE_PATH, (0, generateId_fn_1.default)(), { encoding: 'utf-8' });
}
function killStorageWatcher() {
    if (watcher) {
        watcher.close();
    }
}
exports.killStorageWatcher = killStorageWatcher;
function initStorage() {
    consolidateStorage();
}
exports.initStorage = initStorage;
function getStorageVersion() {
    try {
        return fs_1.default.readFileSync(path_1.default.join(STORAGE_PATH, 'version'), { encoding: 'utf8' });
    }
    catch (error) {
        return '';
    }
}
function getStorageMap() {
    return storageMap;
}
exports.getStorageMap = getStorageMap;
