"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAacTags = exports.writeAacTags = void 0;
const fs = __importStar(require("fs"));
const stringHash = require('string-hash');
const renameObjectKey_fn_1 = require("../functions/renameObjectKey.fn");
const truncToDecimalPoint_fn_1 = __importDefault(require("../functions/truncToDecimalPoint.fn"));
const workers_service_1 = require("../services/workers.service");
/********************** Write Aac Tags **********************/
let tagWriteDeferredPromise = undefined;
let exifToolWriteWorker;
(0, workers_service_1.getWorker)('exifToolWrite').then(worker => {
    exifToolWriteWorker = worker;
    exifToolWriteWorker.on('message', (response) => {
        tagWriteDeferredPromise(response);
    });
});
function writeAacTags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        newTags = normalizeNewTags(newTags);
        tagWriteDeferredPromise = resolve;
        exifToolWriteWorker?.postMessage({ filePath, newTags });
    });
}
exports.writeAacTags = writeAacTags;
/********************** Read Aac Tags **********************/
let exifToolReadWorker;
(0, workers_service_1.getWorker)('exifToolRead').then(worker => {
    exifToolReadWorker = worker;
    exifToolReadWorker.on('message', (response) => {
        tagReadDeferredPromises.get(response.filePath)(response.metadata);
        tagReadDeferredPromises.delete(response.filePath);
    });
});
let tagReadDeferredPromises = new Map();
function getAacTags(filePath) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject('File not found');
        }
        const METADATA = await new Promise((resolve, reject) => {
            tagReadDeferredPromises.set(filePath, resolve);
            exifToolReadWorker?.postMessage(filePath);
        });
        const STATS = fs.statSync(filePath);
        let dateParsed = getDate(String(METADATA.CreateDate || METADATA.ContentCreateDate));
        if (!isNaN(METADATA.Rating))
            METADATA.RatingPercent = METADATA.Rating;
        resolve({
            ID: stringHash(filePath),
            Extension: METADATA.FileTypeExtension,
            SourceFile: filePath,
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
            Rating: METADATA.RatingPercent || METADATA.Rating || null,
            Title: METADATA.Title || null,
            //@ts-expect-error
            Track: getTrack(METADATA.TrackNumber, METADATA.Track) || null,
            BitDepth: METADATA.AudioBitsPerSample || null,
            BitRate: getBitRate(METADATA.AvgBitrate) || null,
            Duration: (0, truncToDecimalPoint_fn_1.default)(METADATA.Duration, 3) || null,
            LastModified: STATS.mtimeMs,
            SampleRate: METADATA.AudioSampleRate || null,
            Size: STATS.size
        });
    });
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
