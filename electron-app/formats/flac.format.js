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
exports.getFlacTags = exports.writeFlacTags = void 0;
const fs_1 = __importDefault(require("fs"));
const string_hash_1 = __importDefault(require("string-hash"));
const mm = require('music-metadata');
function writeFlacTags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        let ffmpegMetatagString = objectToFfmpegString(newTags);
        resolve('');
        /*
                exec(
                    `../binaries/ffmpeg -i "${filePath}"  -map 0 -y -codec copy -write_id3v2 1 ${ffmpegMetatagString} "./out/${filePath
                        .split('/')
                        .pop()}"`,
                    (error, stdout, stderr) => {
                        // if (error) {
                        // 	console.log(error)
                        // }
                        // if (stdout) {
                        // 	console.log(stdout)
                        // }
                        // if (stderr) {
                        // 	console.log(stderr)
                        // 	resolve(undefined)
                        // }
                    }
                ).on('close', () => {
                    resolve('Done')
                })
                */
    });
}
exports.writeFlacTags = writeFlacTags;
function getFlacTags(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let tags = {
                Extension: 'flac'
            };
            const STATS = fs_1.default.statSync(filePath);
            const METADATA = yield mm.parseFile(filePath);
            let nativeTags = mergeNatives(METADATA.native);
            let dateParsed = getDate(String(nativeTags.DATE));
            tags.ID = string_hash_1.default(filePath);
            tags.LastModified = STATS.mtimeMs;
            tags.Size = STATS.size;
            tags.SourceFile = filePath;
            tags.SampleRate = METADATA.format.sampleRate;
            tags.BitRate = METADATA.format.bitrate / 1000;
            tags.Duration = Math.trunc(METADATA.format.duration);
            tags.Album = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.ALBUM) || '';
            tags.Artist = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.ARTIST) || '';
            tags.AlbumArtist = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.ALBUMARTIST) || '';
            tags.Comment = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.DESCRIPTION) || (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.COMMENT) || '';
            tags.Composer = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.COMPOSER) || '';
            tags.Date_Year = dateParsed.year || null;
            tags.Date_Month = dateParsed.month || null;
            tags.Date_Day = dateParsed.day || null;
            tags.DiscNumber = Number(nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.DISCNUMBER) || null;
            tags.Track = Number(nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TRACKNUMBER) || 0;
            tags.Title = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TITLE) || '';
            tags.Genre = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.GENRE) || '';
            tags.Rating = Number(nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.RATING) || 0;
            // console.log(tags)
            resolve(tags);
        }));
    });
}
exports.getFlacTags = getFlacTags;
function mergeNatives(native) {
    let finalObject = {};
    for (let key in native) {
        for (let value in native[key]) {
            finalObject[native[key][value]['id']] = native[key][value]['value'];
        }
    }
    return finalObject;
}
function getDate(dateString) {
    let splitDate = [];
    if (!dateString) {
        return {
            year: undefined,
            month: undefined,
            day: undefined
        };
    }
    // For - Separator
    if (dateString.includes('-')) {
        splitDate = dateString.split('-');
        // For / Separator
    }
    else if (dateString.includes('/')) {
        splitDate = dateString.split('/');
        // For *space* Separator
    }
    else if (dateString.includes(' ')) {
        splitDate = dateString.split(' ');
        // For . Separator
    }
    else if (dateString.includes('.')) {
        splitDate = dateString.split('.');
    }
    if (splitDate.length > 1) {
        return {
            year: Number(splitDate[0]),
            month: Number(splitDate[1]) || undefined,
            day: Number(splitDate[2]) || undefined
        };
    }
    else {
        return {
            year: Number(dateString),
            month: undefined,
            day: undefined
        };
    }
}
function objectToFfmpegString(tags) {
    let finalString = '';
    for (let key in tags) {
        finalString += ` -metadata "${key}=${tags[key]}" `;
    }
    return finalString;
}
function lowerCaseObjectKeys(objectToProcess) {
    let newObject = {};
    for (let key in objectToProcess) {
        newObject[key.toLowerCase()] = objectToProcess[key];
    }
    return newObject;
}
