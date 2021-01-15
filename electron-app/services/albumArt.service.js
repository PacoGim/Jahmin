"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumCover = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
//@ts-ignore
const image_info_1 = __importDefault(require("image-info"));
const __1 = require("..");
const original_fs_1 = require("original-fs");
const config_service_1 = require("./config.service");
const hashString_fn_1 = require("../functions/hashString.fn");
const validVideoExtensions = ['gif', 'mp4'];
const validImageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const validExtensions = [...validImageExtensions, ...validVideoExtensions];
const validNames = ['cover', 'folder', 'front', 'art'];
function getAlbumCover(rootDir) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        let imagePathArray = [];
        let rootDirHashed = hashString_fn_1.hash(rootDir);
        let config = config_service_1.getConfig();
        let dimension = (_a = config === null || config === void 0 ? void 0 : config['art']) === null || _a === void 0 ? void 0 : _a['dimension'];
        let artDirPath = path_1.default.join(__1.appDataPath, 'art', String(dimension));
        let artPath = path_1.default.join(artDirPath, rootDirHashed) + '.webp';
        if (fs_1.default.existsSync(artPath)) {
            return resolve({ fileType: 'image', filePath: artPath });
        }
        try {
            fs_1.default.readdirSync(rootDir).forEach((file) => {
                const ext /*extension*/ = file.split('.').pop();
                if (ext === undefined)
                    return;
                if (validExtensions.includes(ext)) {
                    // return resolve(path.join(rootDir, file))
                    imagePathArray.push(path_1.default.join(rootDir, file));
                }
            });
        }
        catch (err) {
            return resolve(null);
        }
        imagePathArray = imagePathArray.filter((imagePath) => validNames.includes(getFileNameWithoutExtension(imagePath)));
        // If no images with proper naming are found in folder
        if (imagePathArray.length === 0) {
            return resolve(null);
        }
        const videoCoverFound = imagePathArray.find((file) => validVideoExtensions.includes(file.split('.').pop()));
        if (videoCoverFound) {
            return resolve({ fileType: 'video', filePath: videoCoverFound });
        }
        const webpCoverFound = imagePathArray.find((file) => file.split('.').pop() === 'webp');
        if (webpCoverFound) {
            return resolve({ fileType: 'image', filePath: webpCoverFound });
        }
        let bestImagePath = yield getBestImageFromArray(imagePathArray);
        // let compressedImagePath = getImageCompressed(bestImagePath)
        resolve({ fileType: 'image', filePath: bestImagePath });
        //Compress Image AFTER sending it the renderer to avoid waiting for compression.
        compressImage(bestImagePath, artDirPath, artPath);
    }));
}
exports.getAlbumCover = getAlbumCover;
function getImageCompressed(filePath) {
    var _a;
    let config = config_service_1.getConfig();
    let dimension = (_a = config === null || config === void 0 ? void 0 : config['art']) === null || _a === void 0 ? void 0 : _a['dimension'];
    let artDirPath = path_1.default.join(__1.appDataPath, 'art', String(dimension));
    let fileHash = `${hashString_fn_1.hash(filePath)}.webp`;
    let compressedFilePath = path_1.default.join(artDirPath, fileHash);
    if (fs_1.default.existsSync(compressedFilePath)) {
        return compressedFilePath;
    }
    else {
        return undefined;
    }
}
function compressImage(filePath, artDirPath, artPath) {
    var _a;
    let config = config_service_1.getConfig();
    let dimension = (_a = config === null || config === void 0 ? void 0 : config['art']) === null || _a === void 0 ? void 0 : _a['dimension'];
    if (!fs_1.default.existsSync(artDirPath)) {
        original_fs_1.mkdirSync(artDirPath, { recursive: true });
    }
    sharp_1.default(filePath)
        .resize({
        height: dimension * 2,
        width: dimension * 2
    })
        .webp({
        quality: 50
    })
        .toFile(artPath);
}
function getFileNameWithoutExtension(filePath) {
    let fileNameWithExt = filePath.split('/').pop();
    if (!fileNameWithExt)
        return '';
    let fileNameWithoutExt = fileNameWithExt.split('.').shift();
    if (!fileNameWithoutExt)
        return '';
    return fileNameWithoutExt;
}
function getBestImageFromArray(imagePathArray) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let bestImage = { quality: 0, imagePath: '' };
        for (let [index, imagePath] of imagePathArray.entries()) {
            let quality = yield getQuality(imagePath);
            if (quality > bestImage['quality']) {
                // console.log('New Quality: ', quality, ' Old quality: ', bestImage['quality'])
                bestImage = {
                    quality,
                    imagePath
                };
            }
            if (imagePathArray.length === index + 1) {
                resolve(bestImage['imagePath']);
            }
        }
    }));
}
function getQuality(imagePath) {
    return new Promise((resolve, reject) => {
        image_info_1.default(imagePath, (err, info) => {
            if (err) {
                return console.log(err);
            }
            else {
                let quality = info['width'] * info['height'] * info['bytes'];
                resolve(quality);
            }
        });
    });
}
