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
const fs = __importStar(require("fs"));
const path_1 = require("path");
const music_metadata_1 = __importDefault(require("music-metadata"));
const getFileExtension_fn_1 = __importDefault(require("../functions/getFileExtension.fn"));
const allowedSongExtensions_var_1 = __importDefault(require("../global/allowedSongExtensions.var"));
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const sharp = require('sharp');
function default_1(path, artSize, albumId) {
    // If path does not exist
    if (!fs.existsSync(path)) {
        return;
    }
    let pathStats = fs.statSync(path);
    // if the given path is a directory
    if (pathStats.isDirectory()) {
        // Find the first valid song in the directory
        let firstValidFileFound = fs
            .readdirSync(path)
            .find(file => allowedSongExtensions_var_1.default.includes((0, getFileExtension_fn_1.default)(file) || ''));
        // If a valid song is found
        if (firstValidFileFound) {
            // Get its path
            path = (0, path_1.join)(path, firstValidFileFound);
        }
    }
    // Check again if the path exists
    if (!fs.existsSync(path)) {
        return;
    }
    // Gets a Base64 version of the array buffer of the song found
    getCover(path, Number(artSize)).then(base64Cover => {
        (0, sendWebContents_fn_1.default)('send-single-song-art', {
            albumId,
            artSize,
            cover: base64Cover
        });
    });
}
exports.default = default_1;
function getCover(url, artSize) {
    return new Promise((resolve, reject) => {
        // Gets the song metadata
        music_metadata_1.default.parseFile(url).then(({ common }) => {
            // Gets the album art image
            const cover = music_metadata_1.default.selectCover(common.picture); // pick the cover image
            // If no album art found, resolve null
            if (cover === null) {
                resolve(null);
            }
            else {
                // If an album art is found...
                sharp(cover === null || cover === void 0 ? void 0 : cover.data)
                    // Resize it...
                    .resize({
                    height: artSize * 2,
                    width: artSize * 2
                })
                    // Convert it to webp...
                    .webp({
                    quality: 85
                })
                    // Into a buffer...
                    .toBuffer()
                    // Then resolve the Base64 version of the buffer
                    .then((buffer) => {
                    resolve(`data:image/webp;base64,${buffer.toString('base64')}`);
                });
            }
        });
    });
}
