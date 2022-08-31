"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedFiles = exports.sendArtQueueProgress = exports.compressAlbumArt = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const workers_service_1 = require("./workers.service");
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const hashString_fn_1 = __importDefault(require("../functions/hashString.fn"));
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
// Queue for image compression
let compressImageQueue = [];
// let sendArtQueueProgressInterval: NodeJS.Timeout | null = null
let maxCompressImageQueueLength = 0;
let isQueueRuning = false;
let sharpWorker;
(0, workers_service_1.getWorker)('sharp').then(worker => {
    sharpWorker = worker;
    sharpWorker.on('message', data => {
        data.artPath = data.artOutputPath;
        data.success = true;
        data.artSize = data.dimension;
        data.artType = 'image';
        delete data.artOutputDirPath;
        delete data.artOutputPath;
        delete data.dimension;
        (0, sendWebContents_fn_1.default)('new-art', data);
        setTimeout(() => {
            runQueue();
        }, 100);
    });
});
let validFormats = ['mp4', 'webm', 'apng', 'gif', 'webp', 'png', 'jpg', 'jpeg'];
const validNames = ['cover', 'folder', 'front', 'art', 'album'];
const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat();
const notCompress = ['mp4', 'webm', 'apng', 'gif'];
const videoFormats = ['mp4', 'webm'];
function compressAlbumArt(rootDir, artSize, forceNewCheck) {
    // If the art size is not a number, it can't compress the art so it returns.
    if (isNaN(Number(artSize)))
        return;
    // let album = getStorageMap().get(albumId)
    let albumId = (0, hashString_fn_1.default)(rootDir);
    // If album is not found, return.
    if (rootDir === undefined)
        return;
    let artOutputDirPath = path.join((0, getAppDataPath_fn_1.default)(), 'art', String(artSize));
    let artOutputPath = path.join(artOutputDirPath, albumId) + '.webp';
    // Send image if already compressed and a forced new check is set to false.
    if (forceNewCheck === false && fs.existsSync(artOutputPath)) {
        return (0, sendWebContents_fn_1.default)('new-art', {
            artSize,
            success: true,
            albumId,
            artPath: artOutputPath,
            artType: 'image'
        });
    }
    // If album root directory is not found, return.
    if (fs.existsSync(rootDir) === false)
        return;
    let allowedMediaFiles = getAllowedFiles(rootDir);
    if (allowedMediaFiles.length === 0) {
        (0, sendWebContents_fn_1.default)('new-art', {
            artSize,
            success: false,
            albumId
        });
        return;
    }
    let artInputPath = allowedMediaFiles[0];
    // If video found.
    if (videoFormats.includes(getExtension(artInputPath))) {
        (0, sendWebContents_fn_1.default)('new-art', {
            artSize,
            success: true,
            albumId,
            artPath: artInputPath,
            artType: 'video'
        });
    }
    else {
        // Send the first image found uncompressed.
        (0, sendWebContents_fn_1.default)('new-art', {
            artSize,
            success: true,
            albumId,
            artPath: artInputPath,
            artType: 'image'
        });
        if (!notCompress.includes(getExtension(artInputPath))) {
            compressImageQueue.unshift({
                albumId,
                dimension: artSize,
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
}
exports.compressAlbumArt = compressAlbumArt;
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
    (0, sendWebContents_fn_1.default)('art-queue-progress', {
        currentLength: compressImageQueue.length,
        maxLength: maxCompressImageQueueLength
    });
}
exports.sendArtQueueProgress = sendArtQueueProgress;
// Returns all images sorted by priority.
function getAllowedFiles(rootDir) {
    let allowedMediaFiles = fs
        .readdirSync(rootDir)
        .filter(file => allowedNames.includes(file.toLowerCase()))
        .map(file => path.join(rootDir, file))
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
