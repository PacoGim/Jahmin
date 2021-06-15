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
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const string_hash_1 = __importDefault(require("string-hash"));
const renameObjectKey_fn_1 = require("../functions/renameObjectKey.fn");
let ffmpegPath = path_1.default.join(process.cwd(), '/electron-app/binaries/ffmpeg');
const mm = require('music-metadata');
function writeFlacTags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        let ffmpegMetatagString = objectToFfmpegString(newTags);
        let templFileName = filePath.replace(/(\.flac)$/, '.temp.flac');
        child_process_1.exec(`"${ffmpegPath}" -i "${filePath}"  -map 0 -y -codec copy ${ffmpegMetatagString} "${templFileName}" && mv "${templFileName}" "${filePath}"`, (error, stdout, stderr) => { }).on('close', () => {
            resolve('Done');
        });
    });
}
exports.writeFlacTags = writeFlacTags;
function getFlacTags(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let tags = {
                ID: string_hash_1.default(filePath),
                Extension: 'flac',
                SourceFile: filePath
            };
            const STATS = fs_1.default.statSync(filePath);
            const METADATA = yield mm.parseFile(filePath);
            let nativeTags = mergeNatives(METADATA.native);
            let dateParsed = getDate(String(nativeTags.DATE));
            tags.Album = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.ALBUM) || '';
            tags.AlbumArtist = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.ALBUMARTIST) || '';
            tags.Artist = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.ARTIST) || '';
            tags.Comment = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.DESCRIPTION) || (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.COMMENT) || '';
            tags.Composer = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.COMPOSER) || '';
            tags.Date_Year = dateParsed.year || 0;
            tags.Date_Month = dateParsed.month || 0;
            tags.Date_Day = dateParsed.day || 0;
            tags.DiscNumber = Number(nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.DISCNUMBER) || 0;
            tags.Genre = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.GENRE) || '';
            tags.Rating = Number(nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.RATING) || 0;
            tags.Title = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TITLE) || '';
            tags.Track = Number(nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TRACKNUMBER) || 0;
            tags.BitDepth = METADATA.format.bitsPerSample;
            tags.BitRate = METADATA.format.bitrate / 1000;
            tags.Duration = Math.trunc(METADATA.format.duration);
            tags.LastModified = STATS.mtimeMs;
            tags.SampleRate = METADATA.format.sampleRate;
            tags.Size = STATS.size;
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
        // For : Separator
    }
    else if (dateString.includes(':')) {
        splitDate = dateString.split(':');
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
function objectToFfmpegString(newTags) {
    let finalString = '';
    if (newTags.DiscNumber)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'DiscNumber', 'disc');
    if (newTags.AlbumArtist)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'AlbumArtist', 'Album_Artist');
    if (newTags.Date_Year || newTags.Date_Month || newTags.Date_Day) {
        newTags.Date = `${newTags.Date_Year || '0000'}/${newTags.Date_Month || '00'}/${newTags.Date_Day || '00'}`;
        delete newTags.Date_Year;
        delete newTags.Date_Month;
        delete newTags.Date_Day;
    }
    for (let key in newTags) {
        finalString += ` -metadata "${key}=${newTags[key]}" `;
    }
    return finalString;
}
