"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedFiles = exports.sendArtQueueProgress = exports.compressAlbumArt = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const sendWebContents_service_1 = require("./sendWebContents.service");
const storage_service_1 = require("./storage.service");
const worker_service_1 = require("./worker.service");
// Queue for image compression
let compressImageQueue = [];
// let sendArtQueueProgressInterval: NodeJS.Timeout | null = null
let maxCompressImageQueueLength = 0;
let isQueueRuning = false;
let sharpWorker = (0, worker_service_1.getWorker)('sharp');
sharpWorker.on('message', data => {
    data.artInputPath = data.artOutputPath;
    data.success = true;
    data.artSize = data.dimension;
    data.fileType = 'image';
    delete data.artOutputDirPath;
    delete data.artOutputPath;
    delete data.dimension;
    (0, sendWebContents_service_1.sendWebContents)('new-art', data);
    setTimeout(() => {
        runQueue();
    }, 100);
});
let validFormats = ['mp4', 'webm', 'apng', 'gif', 'webp', 'png', 'jpg', 'jpeg'];
const validNames = ['cover', 'folder', 'front', 'art', 'album'];
const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat();
const notCompress = ['mp4', 'webm', 'apng', 'gif'];
const videoFormats = ['mp4', 'webm'];
function compressAlbumArt(albumId, artSizes, forceNewCheck) {
    return new Promise((resolve, reject) => {
        artSizes = filterNumbers(artSizes);
        let album = (0, storage_service_1.getStorageMap)().get(albumId);
        // If album is not found, return.
        if (!album)
            return resolve(undefined);
        artSizes.forEach(artSize => {
            let artOutputDirPath = path_1.default.join((0, __1.appDataPath)(), 'art', String(artSize));
            let artOutputPath = path_1.default.join(artOutputDirPath, albumId) + '.webp';
            if (forceNewCheck === false && fs_1.default.existsSync(artOutputPath)) {
                return (0, sendWebContents_service_1.sendWebContents)('new-art', {
                    artSize,
                    success: true,
                    albumId,
                    artPath: artOutputPath,
                    fileType: 'image'
                });
            }
        });
    });
}
exports.compressAlbumArt = compressAlbumArt;
/**
 * @param {number} arrayToFilter
 * @returns Filtered array.
 * @description Removes all sizes that are not numbers, then changes the type to number.
 */
function filterNumbers(arrayToFilter) {
    return arrayToFilter.filter(value => !isNaN(Number(value))).map(value => Number(value));
}
function runQueue() {
    let task = compressImageQueue.shift();
    if (task === undefined) {
        isQueueRuning = false;
        return;
    }
    sharpWorker.postMessage(task);
}
function sendArtQueueProgress() {
    if (compressImageQueue.length === 0) {
        maxCompressImageQueueLength = 0;
    }
    (0, sendWebContents_service_1.sendWebContents)('art-queue-progress', {
        currentLength: compressImageQueue.length,
        maxLength: maxCompressImageQueueLength
    });
}
exports.sendArtQueueProgress = sendArtQueueProgress;
function getAllowedFiles(album) {
    let allowedMediaFiles = fs_1.default
        .readdirSync(album.RootDir)
        .filter(file => allowedNames.includes(file.toLowerCase()))
        .map(file => path_1.default.join(album.RootDir, file))
        .sort((a, b) => {
        // Gets the priority from the index of the valid formats above.
        // mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
        let aExtension = validFormats.indexOf(getExtension(a));
        let bExtension = validFormats.indexOf(getExtension(b));
        return aExtension - bExtension;
    });
    return allowedMediaFiles;
}
exports.getAllowedFiles = getAllowedFiles;
function getExtension(data) {
    return data.split('.').pop() || '';
}
