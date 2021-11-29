"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumArt = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const __1 = require("..");
const original_fs_1 = require("original-fs");
const config_service_1 = require("./config.service");
const hashString_fn_1 = require("../functions/hashString.fn");
const sendWebContents_service_1 = require("./sendWebContents.service");
const storage_service_1 = require("./storage.service");
function getAlbumArt(albumId, artSize, elementId, forceImage = false, forceNewImage = false) {
    return new Promise((resolve, reject) => {
        var _a;
        let validFormats = ['mp4', 'webm', 'apng', 'gif', 'webp', 'png', 'jpg', 'jpeg'];
        const notCompress = ['mp4', 'webm', 'apng', 'gif'];
        const videoFormats = ['mp4', 'webm'];
        const validNames = ['cover', 'folder', 'front', 'art', 'album'];
        let album = (0, storage_service_1.getStorageMap)().get(albumId);
        if (!album) {
            return resolve(undefined);
        }
        if (forceImage === true) {
            validFormats = validFormats.filter(format => !videoFormats.includes(format));
        }
        const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat();
        let rootDirHashed = (0, hashString_fn_1.hash)(album.RootDir, 'text');
        let config = (0, config_service_1.getConfig)();
        let dimension = artSize || ((_a = config === null || config === void 0 ? void 0 : config.art) === null || _a === void 0 ? void 0 : _a.dimension) || 128;
        let artDirPath = path_1.default.join((0, __1.appDataPath)(), 'art', String(dimension));
        let artFilePath = path_1.default.join(artDirPath, rootDirHashed) + '.webp';
        // If exists resolve right now the already compressed IMAGE ART
        if (forceNewImage === false && fs_1.default.existsSync(artFilePath)) {
            return (0, sendWebContents_service_1.sendWebContents)('new-art', {
                artSize,
                success: true,
                id: rootDirHashed,
                filePath: artFilePath,
                fileType: 'image',
                elementId
            });
        }
        if (fs_1.default.existsSync(album.RootDir) === false) {
            return resolve(undefined);
        }
        let allowedMediaFiles = fs_1.default
            .readdirSync(album.RootDir)
            .filter(file => allowedNames.includes(file.toLowerCase()))
            //@ts-ignore
            .map(file => path_1.default.join(album.RootDir, file))
            .sort((a, b) => {
            // Gets the priority from the index of the valid formats above.
            // mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
            let aExtension = validFormats.indexOf(getExtension(a));
            let bExtension = validFormats.indexOf(getExtension(b));
            return aExtension - bExtension;
        });
        if (allowedMediaFiles.length === 0) {
            (0, sendWebContents_service_1.sendWebContents)('new-art', {
                artSize,
                success: false,
                elementId
            });
            return resolve(undefined);
        }
        let preferredArtPath = allowedMediaFiles[0];
        if (videoFormats.includes(getExtension(preferredArtPath))) {
            // Resolves the best image/video found first, then it will be compressed and sent to renderer.
            (0, sendWebContents_service_1.sendWebContents)('new-art', {
                artSize,
                success: true,
                id: rootDirHashed,
                filePath: preferredArtPath,
                fileType: 'video',
                elementId
            });
        }
        else {
            (0, sendWebContents_service_1.sendWebContents)('new-art', {
                artSize,
                success: true,
                id: rootDirHashed,
                filePath: preferredArtPath,
                fileType: 'image',
                elementId
            });
            if (forceImage === false && !notCompress.includes(getExtension(preferredArtPath))) {
                compressImage(dimension, preferredArtPath, artDirPath, artFilePath).then(artPath => {
                    (0, sendWebContents_service_1.sendWebContents)('new-art', {
                        artSize,
                        success: true,
                        id: rootDirHashed,
                        filePath: artPath,
                        fileType: 'image',
                        elementId
                    });
                });
            }
        }
    });
}
exports.getAlbumArt = getAlbumArt;
function compressImage(dimension, filePath, artDirPath, artPath) {
    return new Promise((resolve, reject) => {
        if (!fs_1.default.existsSync(artDirPath)) {
            (0, original_fs_1.mkdirSync)(artDirPath, { recursive: true });
        }
        (0, sharp_1.default)(filePath)
            .resize({
            height: dimension * 2,
            width: dimension * 2
        })
            .webp({
            quality: 85
        })
            .toFile(artPath)
            .then(() => {
            resolve(artPath);
        })
            .catch(err => {
            console.log('----------');
            console.log(err);
            console.log(filePath);
            console.log('----------');
        });
    });
}
function getExtension(data) {
    return data.split('.').pop() || '';
}
