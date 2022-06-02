"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const music_metadata_1 = __importDefault(require("music-metadata"));
const getFileExtension_fn_1 = __importDefault(require("../functions/getFileExtension.fn"));
const allowedSongExtensions_var_1 = __importDefault(require("../global/allowedSongExtensions.var"));
const sendWebContents_service_1 = require("./sendWebContents.service");
const sharp_1 = __importDefault(require("sharp"));
function default_1(path, artSize, albumId) {
    // If path does not exist
    if (!fs_1.default.existsSync(path)) {
        return;
    }
    let pathStats = fs_1.default.statSync(path);
    // if the given path is a directory
    if (pathStats.isDirectory()) {
        // Find the first valid song in the directory
        let firstValidFileFound = fs_1.default
            .readdirSync(path)
            .find(file => allowedSongExtensions_var_1.default.includes((0, getFileExtension_fn_1.default)(file) || ''));
        // If a valid song is found
        if (firstValidFileFound) {
            // Get its path
            path = path_1.default.join(path, firstValidFileFound);
        }
    }
    // Check again if the path exists
    if (!fs_1.default.existsSync(path)) {
        return;
    }
    // Gets a Base64 version of the array buffer of the song found
    getCover(path, Number(artSize)).then(base64Cover => {
        (0, sendWebContents_service_1.sendWebContents)('send-single-songArt', {
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
                (0, sharp_1.default)(cover === null || cover === void 0 ? void 0 : cover.data)
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
                    .then(buffer => {
                    resolve(`data:image/webp;base64,${buffer.toString('base64')}`);
                });
            }
        });
    });
}
