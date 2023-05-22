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
function saveLyrics(lyrics, songTitle, songArtist) {
    return new Promise(resolve => {
        if (songTitle === null || songTitle === undefined || songArtist === null || songArtist === undefined) {
            return resolve({
                code: -1,
                message: 'Song Title or Song Artist not defined.'
            });
        }
        let lyricsPath = getCleanFileName(`${songTitle}.${songArtist}` + '.txt');
        let lyricsFullPath = path_1.default.join(lyricsFolderPath, lyricsPath);
        if (!fs_1.default.existsSync(lyricsFolderPath)) {
            fs_1.default.mkdirSync(lyricsFolderPath, { recursive: true });
        }
        if (lyrics === 'SaveLyricsFromContextMenu' && fs_1.default.existsSync(lyricsFullPath)) {
            return resolve({
                code: 0,
                message: 'Lyrics saved!',
                data: {
                    title: songTitle,
                    artist: songArtist
                }
            });
        }
        else {
            if (lyrics === 'SaveLyricsFromContextMenu')
                lyrics = '';
            lyrics = `Song Title: ${songTitle}\nSong Artist: ${songArtist}\n\n${lyrics}`;
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
                            title: songTitle,
                            artist: songArtist
                        }
                    });
                }
            });
        }
    });
}
exports.saveLyrics = saveLyrics;
function getLyrics(songTitle, songArtist) {
    return new Promise((resolve, reject) => {
        let lyricsPath = (0, sanitize_filename_1.default)(`${songTitle})_(${songArtist}.txt`);
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
        let lyricFilesPathList = fs_1.default
            .readdirSync(lyricsFolderPath)
            .filter(file => file.endsWith('.txt'))
            .map(file => path_1.default.join(lyricsFolderPath, file));
        let lyricList = lyricFilesPathList.map(lyricFilePath => {
            let lyricsFileContent = fs_1.default.readFileSync(lyricFilePath, { encoding: 'utf8' });
            let lyricsSongTitle = lyricsFileContent.split('\n')[0].split('Song Title: ')[1].trim();
            let lyricsSongArtist = lyricsFileContent.split('\n')[1].split('Song Artist: ')[1].trim();
            // let lyricsSongLyrics = lyricsFileContent.split('\n').slice(3).join('\n')
            return {
                title: lyricsSongTitle,
                artist: lyricsSongArtist
            };
        });
        resolve(lyricList);
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
