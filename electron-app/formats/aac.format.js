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
exports.getAacTags = exports.writeAacTags = void 0;
const exiftool_vendored_1 = require("exiftool-vendored");
const exiftool = new exiftool_vendored_1.ExifTool({ taskTimeoutMillis: 5000 });
const fs_1 = __importDefault(require("fs"));
const string_hash_1 = __importDefault(require("string-hash"));
const renameObjectKey_fn_1 = require("../functions/renameObjectKey.fn");
const worker_service_1 = require("../services/worker.service");
function writeAacTags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        newTags = normalizeNewTags(newTags);
        exiftool
            .write(filePath, newTags, ['-overwrite_original'])
            .then(() => {
            resolve('');
        })
            .catch((err) => {
            reject(err);
        });
    });
}
exports.writeAacTags = writeAacTags;
/********************** Get Aac Tags **********************/
let worker = worker_service_1.getWorker('exifTool');
let deferredPromise = new Map();
worker === null || worker === void 0 ? void 0 : worker.on('message', (data) => {
    deferredPromise.get(data.filePath)(data.metadata);
    deferredPromise.delete(data.filePath);
});
function getAacTags(filePath) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const METADATA = yield new Promise((resolve, reject) => {
            deferredPromise.set(filePath, resolve);
            worker === null || worker === void 0 ? void 0 : worker.postMessage(filePath);
        });
        const STATS = fs_1.default.statSync(filePath);
        let dateParsed = getDate(String(METADATA.CreateDate || METADATA.ContentCreateDate));
        resolve({
            ID: string_hash_1.default(filePath),
            Extension: METADATA.FileTypeExtension,
            SourceFile: METADATA.SourceFile || '',
            Album: METADATA.Album || '',
            AlbumArtist: METADATA.AlbumArtist || '',
            Artist: METADATA.Artist || '',
            Comment: METADATA.Comment || '',
            Composer: METADATA.Composer || '',
            Date_Year: dateParsed.year || 0,
            Date_Month: dateParsed.month || 0,
            DiscNumber: METADATA.DiskNumber || 0,
            Date_Day: dateParsed.day || 0,
            Genre: METADATA.Genre || '',
            Rating: METADATA.RatingPercent || 0,
            Title: METADATA.Title || '',
            //@ts-expect-error
            Track: getTrack(METADATA.TrackNumber, METADATA.Track) || 0,
            BitDepth: METADATA.AudioBitsPerSample,
            BitRate: getBitRate(METADATA.AvgBitrate),
            Duration: METADATA.Duration,
            LastModified: STATS.mtimeMs,
            SampleRate: METADATA.AudioSampleRate,
            Size: STATS.size
        });
    }));
}
exports.getAacTags = getAacTags;
function normalizeNewTags(newTags) {
    if (newTags.DiscNumber)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'DiscNumber', 'DiskNumber');
    if (newTags.Track)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Track', 'TrackNumber');
    if (newTags.Rating)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Rating', 'RatingPercent');
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
    let numberedTrackFound = trackValues.find((i) => typeof i === 'number');
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
