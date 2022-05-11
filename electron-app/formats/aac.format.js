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
exports.getAacTags = exports.writeAacTags = void 0;
// import { ExifTool } from 'exiftool-vendored'
// const exiftool = new ExifTool({ taskTimeoutMillis: 5000 })
const fs_1 = __importDefault(require("fs"));
const string_hash_1 = __importDefault(require("string-hash"));
const renameObjectKey_fn_1 = require("../functions/renameObjectKey.fn");
const worker_service_1 = require("../services/worker.service");
/********************** Write Aac Tags **********************/
let tagWriteDeferredPromise = undefined;
let exifToolWriteWorker = (_a = (0, worker_service_1.getWorker)('exifToolWrite')) === null || _a === void 0 ? void 0 : _a.on('message', (response) => {
    tagWriteDeferredPromise(response);
});
function writeAacTags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        newTags = normalizeNewTags(newTags);
        tagWriteDeferredPromise = resolve;
        exifToolWriteWorker === null || exifToolWriteWorker === void 0 ? void 0 : exifToolWriteWorker.postMessage({ filePath, newTags });
    });
}
exports.writeAacTags = writeAacTags;
/********************** Read Aac Tags **********************/
let exifToolReadWorker = undefined;
let tagReadDeferredPromises = new Map();
function getAacTags(filePath) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        if (exifToolReadWorker === undefined) {
            exifToolReadWorker = (0, worker_service_1.getWorker)('exifToolRead');
            exifToolReadWorker === null || exifToolReadWorker === void 0 ? void 0 : exifToolReadWorker.on('message', (response) => {
                tagReadDeferredPromises.get(response.filePath)(response.metadata);
                tagReadDeferredPromises.delete(response.filePath);
            });
        }
        const METADATA = yield new Promise((resolve, reject) => {
            tagReadDeferredPromises.set(filePath, resolve);
            exifToolReadWorker === null || exifToolReadWorker === void 0 ? void 0 : exifToolReadWorker.postMessage(filePath);
        });
        const STATS = fs_1.default.statSync(filePath);
        let dateParsed = getDate(String(METADATA.CreateDate || METADATA.ContentCreateDate));
        resolve({
            ID: (0, string_hash_1.default)(filePath),
            Extension: METADATA.FileTypeExtension,
            SourceFile: METADATA.SourceFile || null,
            Album: METADATA.Album || null,
            AlbumArtist: METADATA.AlbumArtist || null,
            Artist: METADATA.Artist || null,
            Comment: METADATA.Comment || null,
            Composer: METADATA.Composer || null,
            Date_Year: dateParsed.year || null,
            Date_Month: dateParsed.month || null,
            DiscNumber: METADATA.DiskNumber || null,
            Date_Day: dateParsed.day || null,
            Genre: METADATA.Genre || null,
            Rating: METADATA.RatingPercent || null,
            Title: METADATA.Title || null,
            //@ts-expect-error
            Track: getTrack(METADATA.TrackNumber, METADATA.Track) || null,
            BitDepth: METADATA.AudioBitsPerSample || null,
            BitRate: getBitRate(METADATA.AvgBitrate) || null,
            Duration: METADATA.Duration || null,
            LastModified: STATS.mtimeMs,
            SampleRate: METADATA.AudioSampleRate || null,
            Size: STATS.size
        });
    }));
}
exports.getAacTags = getAacTags;
function normalizeNewTags(newTags) {
    if (newTags.DiscNumber !== undefined)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'DiscNumber', 'DiskNumber');
    if (newTags.Track !== undefined)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'Track', 'TrackNumber');
    // if (newTags.Rating !== undefined) renameObjectKey(newTags, 'Rating', 'RatingPercent')
    if (newTags.Date_Year || newTags.Date_Month || newTags.Date_Day) {
        newTags.AllDates = `${newTags.Date_Year || '0000'} ${newTags.Date_Month || '00'} ${newTags.Date_Day || '00'}`;
        if (newTags.Date_Year && newTags.Date_Month) {
            newTags.ContentCreateDate = new Date(`${newTags.Date_Year}:${Number(newTags.Date_Month) + 1}:${newTags.Date_Day || 1}`).toUTCString();
        }
        delete newTags.Date_Year;
        delete newTags.Date_Month;
        delete newTags.Date_Day;
    }
    return newTags;
}
function getBitRate(bitRate) {
    if (bitRate) {
        return Number(bitRate.replace(/\D/g, ''));
    }
    else {
        return undefined;
    }
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
    if (dateString.includes('T')) {
        dateString = dateString.split('T')[0];
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
function getTrack(...trackValues) {
    let numberedTrackFound = trackValues.find(i => typeof i === 'number');
    if (numberedTrackFound) {
        return numberedTrackFound;
    }
    for (let value of trackValues) {
        if (typeof value === 'string') {
            let splitTrack = Number(value.split(' ')[0]);
            if (!isNaN(splitTrack)) {
                return splitTrack;
            }
        }
    }
}
