"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedFiles = exports.sendArtQueueProgress = exports.getAlbumArt = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const config_service_1 = require("./config.service");
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
function getAlbumArt(albumId, artSize, elementId, forceImage = false) {
    return new Promise((resolve, reject) => {
        var _a;
        let album = (0, storage_service_1.getStorageMap)().get(albumId);
        if (!album) {
            return resolve(undefined);
        }
        if (forceImage === true) {
            validFormats = validFormats.filter(format => !videoFormats.includes(format));
        }
        let config = (0, config_service_1.getConfig)();
        let dimension = artSize || ((_a = config === null || config === void 0 ? void 0 : config.userOptions) === null || _a === void 0 ? void 0 : _a.artSize) || 128;
        let artOutputDirPath = path_1.default.join((0, __1.appDataPath)(), 'art', String(dimension));
        let artOutputPath = path_1.default.join(artOutputDirPath, albumId) + '.webp';
        // If exists resolve right now the already compressed IMAGE ART
        if (fs_1.default.existsSync(artOutputPath)) {
            return (0, sendWebContents_service_1.sendWebContents)('new-art', {
                artSize,
                success: true,
                albumId,
                artInputPath: artOutputPath,
                fileType: 'image',
                elementId
            });
        }
        if (fs_1.default.existsSync(album.RootDir) === false) {
            return resolve(undefined);
        }
        let allowedMediaFiles = getAllowedFiles(album);
        if (allowedMediaFiles.length === 0) {
            (0, sendWebContents_service_1.sendWebContents)('new-art', {
                artSize,
                success: false,
                elementId
            });
            return resolve(undefined);
        }
        let artInputPath = allowedMediaFiles[0];
        // Resolves the best image/video found first, then it will be compressed and sent to renderer.
        if (videoFormats.includes(getExtension(artInputPath))) {
            (0, sendWebContents_service_1.sendWebContents)('new-art', {
                artSize,
                success: true,
                albumId,
                artInputPath,
                fileType: 'video',
                elementId
            });
            artInputPath = allowedMediaFiles.filter(file => !notCompress.includes(getExtension(file)))[0];
            if (artInputPath !== undefined) {
                (0, sendWebContents_service_1.sendWebContents)('new-art', {
                    artSize,
                    success: true,
                    albumId,
                    artInputPath,
                    fileType: 'image',
                    elementId
                });
            }
        }
        else {
            (0, sendWebContents_service_1.sendWebContents)('new-art', {
                artSize,
                success: true,
                albumId,
                artInputPath,
                fileType: 'image',
                elementId
            });
            if (forceImage === false && !notCompress.includes(getExtension(artInputPath))) {
                compressImageQueue.unshift({
                    albumId,
                    elementId,
                    dimension,
                    artInputPath,
                    artOutputDirPath,
                    artOutputPath
                });
                if (compressImageQueue.length > maxCompressImageQueueLength) {
                    maxCompressImageQueueLength = compressImageQueue.length;
                }
                if (isQueueRuning === false) {
                    isQueueRuning = true;
                    sendArtQueueProgress();
                    runQueue();
                }
            }
        }
    });
}
exports.getAlbumArt = getAlbumArt;
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
