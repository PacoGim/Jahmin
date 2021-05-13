"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAacTags = exports.writeAacTags = void 0;
const exiftool_vendored_1 = require("exiftool-vendored");
const exiftool = new exiftool_vendored_1.ExifTool({ taskTimeoutMillis: 5000 });
const fs_1 = __importDefault(require("fs"));
const string_hash_1 = __importDefault(require("string-hash"));
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
function getAacTags(filePath) {
    return new Promise((resolve, reject) => {
        exiftool.read(filePath).then((tags) => {
            fs_1.default.stat(filePath, (err, fileStats) => {
                //@ts-expect-error
                let dateParsed = getDate(String(tags.CreateDate || tags.ContentCreateDate));
                resolve({
                    ID: string_hash_1.default(filePath),
                    //@ts-expect-error
                    Album: tags['Album'] || '',
                    //@ts-expect-error
                    AlbumArtist: tags['AlbumArtist'] || '',
                    Artist: tags['Artist'] || '',
                    //@ts-expect-error
                    Composer: tags['Composer'] || '',
                    //@ts-expect-error
                    Genre: tags['Genre'] || '',
                    //@ts-expect-error
                    DiscNumber: tags['DiskNumber'] || 0,
                    Title: tags['Title'] || '',
                    //@ts-expect-error
                    Track: getTrack(tags['TrackNumber'], tags['Track']) || 0,
                    Rating: tags['RatingPercent'] || 0,
                    Date_Year: dateParsed['year'] || 0,
                    Date_Month: dateParsed['month'] || 0,
                    Date_Day: dateParsed['day'] || 0,
                    Comment: tags['Comment'] || '',
                    SourceFile: tags['SourceFile'] || '',
                    Extension: tags['FileTypeExtension'],
                    Size: fileStats.size,
                    Duration: tags['Duration'],
                    SampleRate: tags['AudioSampleRate'],
                    LastModified: fileStats.mtimeMs,
                    BitRate: getBitRate(tags['AvgBitrate']),
                    BitDepth: tags['AudioBitsPerSample']
                });
            });
        });
    });
}
exports.getAacTags = getAacTags;
function normalizeNewTags(newTags) {
    let stringObject = JSON.stringify(newTags);
    if (newTags.DiscNumber) {
        stringObject = stringObject.replace('DiscNumber', 'DiskNumber');
    }
    if (newTags.Track) {
        stringObject = stringObject.replace('Track', 'TrackNumber');
    }
    if (newTags.Rating) {
        stringObject = stringObject.replace('Rating', 'RatingPercent');
    }
    newTags = JSON.parse(stringObject);
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
