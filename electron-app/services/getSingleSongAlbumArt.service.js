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
function default_1(url, artSize, albumId) {
    if (!fs_1.default.existsSync(url)) {
        return;
    }
    let pathStats = fs_1.default.statSync(url);
    if (pathStats.isDirectory()) {
        let firstValidFileFound = fs_1.default
            .readdirSync(url)
            .find(file => allowedSongExtensions_var_1.default.includes((0, getFileExtension_fn_1.default)(file) || ''));
        if (firstValidFileFound) {
            url = path_1.default.join(url, firstValidFileFound);
        }
    }
    if (!fs_1.default.existsSync(url)) {
        return;
    }
    getCover(url, Number(artSize)).then(base64Cover => {
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
        music_metadata_1.default.parseFile(url).then(({ common }) => {
            const cover = music_metadata_1.default.selectCover(common.picture); // pick the cover image
            if (cover === null) {
                resolve(null);
            }
            else {
                (0, sharp_1.default)(cover === null || cover === void 0 ? void 0 : cover.data)
                    .resize({
                    height: artSize * 2,
                    width: artSize * 2
                })
                    .webp({
                    quality: 85
                })
                    .toBuffer()
                    .then(buffer => {
                    resolve(`data:image/webp;base64,${buffer.toString('base64')}`);
                });
            }
        });
    });
}
