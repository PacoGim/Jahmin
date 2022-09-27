"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLyrics = exports.saveLyrics = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
let lyricsFolderPath = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'lyrics');
function saveLyrics(lyrics, songTile, songArtist, songDuration) {
    return new Promise((resolve, reject) => {
        songDuration = Math.trunc(songDuration);
        let lyricsPath = (0, sanitize_filename_1.default)(`${songTile}-${songArtist}-${songDuration}.txt`);
        if (!fs_1.default.existsSync(lyricsFolderPath)) {
            fs_1.default.mkdirSync(lyricsFolderPath, { recursive: true });
        }
        fs_1.default.writeFile(path_1.default.join(lyricsFolderPath, lyricsPath), lyrics, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve(`${songTile} lyrics saved!`);
            }
        });
    });
}
exports.saveLyrics = saveLyrics;
function getLyrics(songTile, songArtist, songDuration) {
    return new Promise((resolve, reject) => {
        songDuration = Math.trunc(songDuration);
        let lyricsPath = (0, sanitize_filename_1.default)(`${songTile}-${songArtist}-${songDuration}.txt`);
        fs_1.default.readFile(path_1.default.join(lyricsFolderPath, lyricsPath), { encoding: 'utf8' }, (err, lyrics) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(lyrics);
            }
        });
    });
}
exports.getLyrics = getLyrics;