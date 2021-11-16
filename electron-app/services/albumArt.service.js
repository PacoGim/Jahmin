"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumCover = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const __1 = require("..");
const original_fs_1 = require("original-fs");
const config_service_1 = require("./config.service");
const hashString_fn_1 = require("../functions/hashString.fn");
const sendWebContents_service_1 = require("./sendWebContents.service");
function getAlbumCover(rootDir, forceImage = false, forceNewImage = false) {
    return new Promise((resolve, reject) => {
        var _a;
        let validFormats = ['mp4', 'webm', 'apng', 'gif', 'webp', 'png', 'jpg', 'jpeg'];
        const notCompress = ['mp4', 'webm', 'apng', 'gif'];
        const videoFormats = ['mp4', 'webm'];
        const validNames = ['cover', 'folder', 'front', 'art', 'album'];
        if (forceImage === true) {
            validFormats = validFormats.filter(format => !videoFormats.includes(format));
        }
        const allowedNames = validNames.map(name => validFormats.map(ext => `${name}.${ext}`)).flat();
        let rootDirHashed = (0, hashString_fn_1.hash)(rootDir, 'text');
        let config = (0, config_service_1.getConfig)();
        let dimension = ((_a = config === null || config === void 0 ? void 0 : config.art) === null || _a === void 0 ? void 0 : _a.dimension) || 128;
        let artDirPath = path_1.default.join((0, __1.appDataPath)(), 'art', String(dimension));
        let artFilePath = path_1.default.join(artDirPath, rootDirHashed) + '.webp';
        // If exists resolve right now the already compressed IMAGE ART
        if (forceNewImage === false && fs_1.default.existsSync(artFilePath)) {
            return resolve({ fileType: 'image', filePath: artFilePath });
        }
        if (fs_1.default.existsSync(rootDir) === false) {
            return resolve(undefined);
        }
        let allowedMediaFiles = fs_1.default
            .readdirSync(rootDir)
            .filter(file => allowedNames.includes(file.toLowerCase()))
            .map(file => path_1.default.join(rootDir, file))
            .sort((a, b) => {
            // Gets the priority from the index of the valid formats above.
            // mp4 has a priority of 0 while gif has a priority of 3, lower number is higher priority.
            let aExtension = validFormats.indexOf(getExtension(a));
            let bExtension = validFormats.indexOf(getExtension(b));
            return aExtension - bExtension;
        });
        if (allowedMediaFiles.length === 0) {
            return resolve(undefined);
        }
        let preferredArt = allowedMediaFiles[0];
        if (videoFormats.includes(getExtension(preferredArt))) {
            resolve({ fileType: 'video', filePath: preferredArt });
        }
        else {
            resolve({ fileType: 'image', filePath: preferredArt });
            if (forceImage === false && !notCompress.includes(getExtension(preferredArt))) {
                compressImage(preferredArt, artDirPath, artFilePath).then(artPath => {
                    (0, sendWebContents_service_1.sendWebContents)('new-cover', {
                        success: true,
                        id: rootDirHashed,
                        filePath: artPath,
                        fileType: 'image'
                    });
                });
            }
        }
    });
}
exports.getAlbumCover = getAlbumCover;
function compressImage(filePath, artDirPath, artPath) {
    return new Promise((resolve, reject) => {
        var _a;
        let config = (0, config_service_1.getConfig)();
        let dimension = ((_a = config === null || config === void 0 ? void 0 : config.art) === null || _a === void 0 ? void 0 : _a.dimension) || 128;
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
        });
    });
}
function getExtension(data) {
    return data.split('.').pop() || '';
}
