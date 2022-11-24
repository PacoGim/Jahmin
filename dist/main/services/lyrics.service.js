"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLyrics = exports.getLyricsList = exports.getLyrics = exports.saveLyrics = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sanitize_filename_1 = __importDefault(require("sanitize-filename"));
const getAppDataPath_fn_1 = __importDefault(require("../functions/getAppDataPath.fn"));
let lyricsFolderPath = path_1.default.join((0, getAppDataPath_fn_1.default)(), 'lyrics');
function saveLyrics(lyrics, songTile, songArtist) {
    return new Promise((resolve, reject) => {
        if (songTile === null || songTile === undefined || songArtist === null || songArtist === undefined) {
            return reject('Song Title or Song Artist not defined.');
        }
        let lyricsPath = (0, sanitize_filename_1.default)(`${songTile})_(${songArtist}.txt`);
        let lyricsFullPath = path_1.default.join(lyricsFolderPath, lyricsPath);
        if (!fs_1.default.existsSync(lyricsFolderPath)) {
            fs_1.default.mkdirSync(lyricsFolderPath, { recursive: true });
        }
        if (lyrics === null) {
            if (!fs_1.default.existsSync(lyricsFullPath)) {
                fs_1.default.writeFile(lyricsFullPath, '', err => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(`${songTile} lyrics saved!`);
                    }
                });
            }
            else {
                resolve(`${songTile} lyrics saved!`);
            }
        }
        else {
            fs_1.default.writeFile(lyricsFullPath, lyrics, err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(`${songTile} lyrics saved!`);
                }
            });
        }
    });
}
exports.saveLyrics = saveLyrics;
function getLyrics(songTile, songArtist) {
    return new Promise((resolve, reject) => {
        let lyricsPath = (0, sanitize_filename_1.default)(`${songTile})_(${songArtist}.txt`);
        fs_1.default.readFile(path_1.default.join(lyricsFolderPath, lyricsPath), { encoding: 'utf8' }, (err, lyrics) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    resolve('');
                }
                else {
                    reject(err);
                }
            }
            else {
                resolve(lyrics);
            }
        });
    });
}
exports.getLyrics = getLyrics;
function getLyricsList() {
    return new Promise((resolve, reject) => {
        let lyricsList = fs_1.default
            .readdirSync(lyricsFolderPath)
            .filter(file => file.endsWith('.txt'))
            .map(file => file.split('.')[0])
            .map(file => {
            let fileSplit = file.split(')_(');
            return {
                title: fileSplit[0],
                artist: fileSplit[1]
            };
        });
        resolve(lyricsList);
    });
}
exports.getLyricsList = getLyricsList;
function deleteLyrics(title, artist) {
    return new Promise((resolve, reject) => {
        let lyricsPath = (0, sanitize_filename_1.default)(`${title})_(${artist}.txt`);
        let lyricsAbsolutePath = path_1.default.join(lyricsFolderPath, lyricsPath);
        if (fs_1.default.existsSync(lyricsAbsolutePath)) {
            fs_1.default.unlink(lyricsAbsolutePath, err => {
                if (err) {
                    resolve({ isError: true, message: 'Error when deleting' });
                }
                else {
                    resolve({
                        isError: false,
                        message: 'Deleted successfully',
                        data: {
                            title,
                            artist
                        }
                    });
                }
            });
        }
        else {
            resolve({ isError: true, message: 'Lyrics not found' });
        }
    });
}
exports.deleteLyrics = deleteLyrics;
