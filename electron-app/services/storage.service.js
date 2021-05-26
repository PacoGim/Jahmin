"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consolidateStorage = exports.getStorageMap = exports.getStorageMapToArray = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const hashString_fn_1 = require("../functions/hashString.fn");
const STORAGE_PATH = path_1.default.join(__1.appDataPath(), 'storage');
let storageMap;
let storageVersion;
function getStorageMapToArray() {
    let map = getStorageMap();
    let array = [];
    map.forEach((album) => {
        array = array.concat(album.Songs);
    });
    return array;
}
exports.getStorageMapToArray = getStorageMapToArray;
function getStorageMap() {
    let version = getStorageVersion();
    if (version !== storageVersion) {
        storageVersion = version;
        return consolidateStorage();
    }
    else {
        return storageMap;
    }
}
exports.getStorageMap = getStorageMap;
function consolidateStorage() {
    let map = new Map();
    if (!fs_1.default.existsSync(STORAGE_PATH)) {
        fs_1.default.mkdirSync(STORAGE_PATH);
    }
    let storageFiles = fs_1.default.readdirSync(STORAGE_PATH).filter((file) => !['.DS_Store', 'version'].includes(file));
    storageFiles.forEach((file) => {
        let fileData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(STORAGE_PATH, file), { encoding: 'utf-8' }));
        for (let songId in fileData) {
            let song = fileData[songId];
            let rootDir = song.SourceFile.split('/').slice(0, -1).join('/');
            let rootId = hashString_fn_1.hash(rootDir, 'text');
            let data = map.get(rootId);
            if (data) {
                if (!data.Songs.find((i) => i.ID === song.ID)) {
                    data.Songs.push(song);
                    map.set(rootId, data);
                }
            }
            else {
                map.set(rootId, {
                    ID: rootId,
                    RootDir: rootDir,
                    Name: song.Album,
                    Songs: [song]
                });
            }
        }
    });
    storageMap = map;
    return map;
}
exports.consolidateStorage = consolidateStorage;
function getStorageVersion() {
    return Number(fs_1.default.readFileSync(path_1.default.join(STORAGE_PATH, 'version'), { encoding: 'utf8' }));
}
