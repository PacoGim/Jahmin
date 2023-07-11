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
const getDirectory_fn_1 = __importDefault(require("../functions/getDirectory.fn"));
/********************** Write Aac Tags **********************/
let exifToolWriteWorker;
(0, workers_service_1.getWorker)('exifToolWrite').then(worker => {
    exifToolWriteWorker = worker;
});
function writeAacTags(filePath, newTags) {
    return new Promise(async (resolve, reject) => {
        newTags = normalizeNewTags(newTags);
        (0, workers_service_1.useWorker)({ filePath, newTags }, exifToolWriteWorker).then(response => {
            resolve(response);
        });
    });
}
exports.writeAacTags = writeAacTags;
/********************** Read Aac Tags **********************/
let exifToolReadWorker;
(0, workers_service_1.getWorker)('exifToolRead').then(worker => {
    exifToolReadWorker = worker;
});
function getAacTags(filePath) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject('File not found');
        }
        (0, workers_service_1.useWorker)({ filePath }, exifToolReadWorker).then(response => {
            const metadata = response.results.metadata;
            const STATS = fs.statSync(filePath);
            let dateParsed = getDate(String(metadata.ContentCreateDate || metadata.CreateDate));
            if (!isNaN(metadata.Rating))
                metadata.RatingPercent = metadata.Rating;
            resolve({
                ID: stringHash(filePath),
                Directory: (0, getDirectory_fn_1.default)(filePath),
                Extension: metadata.FileTypeExtension,
                SourceFile: filePath,
                Album: metadata.Album || null,
                AlbumArtist: metadata.AlbumArtist || null,
                Artist: metadata.Artist || null,
                Comment: metadata.Comment || null,
                Composer: metadata.Composer || null,
                Date_Year: dateParsed.year || null,
                Date_Month: dateParsed.month || null,
                DiscNumber: metadata.DiskNumber || null,
                Date_Day: dateParsed.day || null,
                Genre: metadata.Genre || null,
                Rating: metadata.RatingPercent || metadata.Rating || null,
                Title: metadata.Title || null,
                //@ts-expect-error
                Track: getTrack(metadata.TrackNumber, metadata.Track) || null,
                BitDepth: metadata.AudioBitsPerSample || null,
                BitRate: getBitRate(metadata.AvgBitrate) || null,
                Duration: (0, truncToDecimalPoint_fn_1.default)(metadata.Duration, 3) || null,
                LastModified: STATS.mtimeMs,
                SampleRate: metadata.AudioSampleRate || null,
                Size: STATS.size,
                PlayCount: 0
            });
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
