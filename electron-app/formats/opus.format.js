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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpusTags = exports.writeOpusTags = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const string_hash_1 = __importDefault(require("string-hash"));
const generateId_fn_1 = require("../functions/generateId.fn");
const worker_service_1 = require("../services/worker.service");
let ffmpegPath = path_1.default.join(process.cwd(), '/electron-app/binaries/ffmpeg');
const mm = require('music-metadata');
/********************** Write Opus Tags **********************/
let ffmpegDeferredPromise = undefined;
let ffmpegDeferredPromiseId;
const ffmpegWorker = (_a = worker_service_1.getWorker('ffmpeg')) === null || _a === void 0 ? void 0 : _a.on('message', (response) => __awaiter(void 0, void 0, void 0, function* () {
    if (response.id === ffmpegDeferredPromiseId) {
        fs_1.default.unlinkSync(response.filePath);
        fs_1.default.renameSync(response.tempFileName, response.filePath);
        ffmpegDeferredPromise(response.status);
    }
}));
function writeOpusTags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        ffmpegDeferredPromise = resolve;
        ffmpegDeferredPromiseId = generateId_fn_1.generateId();
        let ffmpegString = objectToFfmpegString(newTags);
        let tempFileName = filePath.replace(/(\.opus)$/, '.temp.opus');
        let command = `"${ffmpegPath}" -i "${filePath}" -y -map_metadata 0:s:a:0 -codec copy ${ffmpegString} "${tempFileName}"`;
        ffmpegWorker === null || ffmpegWorker === void 0 ? void 0 : ffmpegWorker.postMessage({ id: ffmpegDeferredPromiseId, filePath, tempFileName, command });
    });
}
exports.writeOpusTags = writeOpusTags;
/********************** Get Opus Tags **********************/
let mmWorker = worker_service_1.getWorker('musicMetadata');
let mmDeferredPromises = new Map();
mmWorker === null || mmWorker === void 0 ? void 0 : mmWorker.on('message', (data) => {
    if (mmDeferredPromises.has(data.filePath)) {
        mmDeferredPromises.get(data.filePath)(data.metadata);
        mmDeferredPromises.delete(data.filePath);
    }
});
function getOpusTags(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const METADATA = yield new Promise((resolve, reject) => {
                mmDeferredPromises.set(filePath, resolve);
                mmWorker === null || mmWorker === void 0 ? void 0 : mmWorker.postMessage(filePath);
            });
            let tags = {
                ID: string_hash_1.default(filePath),
                Extension: 'opus',
                SourceFile: filePath
            };
            const STATS = fs_1.default.statSync(filePath);
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
            tags.BitRate = METADATA.format.bitrate / 1000;
            tags.Duration = Math.trunc(METADATA.format.duration);
            tags.LastModified = STATS.mtimeMs;
            tags.SampleRate = METADATA.format.sampleRate;
            tags.Size = STATS.size;
            resolve(tags);
        }));
    });
}
exports.getOpusTags = getOpusTags;
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
    // if (newTags.DiscNumber) renameObjectKey(newTags, 'DiscNumber', 'disc')
    // if (newTags.AlbumArtist) renameObjectKey(newTags, 'AlbumArtist', 'Album_Artist')
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
