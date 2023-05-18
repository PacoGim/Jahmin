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
    return new Promise(resolve => {
        if (songTile === null || songTile === undefined || songArtist === null || songArtist === undefined) {
            return resolve({
                code: -1,
                message: 'Song Title or Song Artist not defined.'
            });
        }
        let lyricsPath = getCleanFileName(`${songTile}.${songArtist}` + '.txt');
        let lyricsFullPath = path_1.default.join(lyricsFolderPath, lyricsPath);
        if (!fs_1.default.existsSync(lyricsFolderPath)) {
            fs_1.default.mkdirSync(lyricsFolderPath, { recursive: true });
        }
        fs_1.default.writeFile(lyricsFullPath, lyrics, err => {
            if (err) {
                resolve({
                    code: -1,
                    message: 'Could not write file'
                });
            }
            else {
                resolve({
                    code: 0,
                    message: 'Lyrics saved!',
                    data: {
                        songTile,
                        songArtist
                    }
                });
            }
        });
    });
}
exports.saveLyrics = saveLyrics;
function getCleanFileName(str) {
    return removeIllegalCharacters((0, sanitize_filename_1.default)(`${removeSpacesAndUppercaseFirst(str)}`));
}
function removeIllegalCharacters(str) {
    let illegalChars = /[<>:"\/\\|?*\x00-\x1F]/g;
    return str.replace(illegalChars, '');
}
function removeSpacesAndUppercaseFirst(str) {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}
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
