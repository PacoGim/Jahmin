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
exports.getMp3Tags = exports.writeMp3Tags = void 0;
const fs = __importStar(require("fs"));
const stringHash = require('string-hash');
const renameObjectKey_fn_1 = require("../functions/renameObjectKey.fn");
const workers_service_1 = require("../services/workers.service");
const truncToDecimalPoint_fn_1 = __importDefault(require("../functions/truncToDecimalPoint.fn"));
/********************** Write Mp3 Tags **********************/
let tagWriteDeferredPromise = undefined;
let nodeId3Worker;
(0, workers_service_1.getWorker)('nodeID3').then(worker => {
    nodeId3Worker = worker;
    nodeId3Worker.on('message', (response) => {
        tagWriteDeferredPromise(response);
    });
});
function writeMp3Tags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        newTags = normalizeNewTags(newTags);
        tagWriteDeferredPromise = resolve;
        nodeId3Worker?.postMessage({ filePath, newTags });
    });
}
exports.writeMp3Tags = writeMp3Tags;
/********************** Get Mp3 Tags **********************/
let deferredPromise = new Map();
let mmWorker;
(0, workers_service_1.getWorker)('musicMetadata').then(worker => {
    mmWorker = worker;
    mmWorker.on('message', data => {
        if (deferredPromise.has(data.filePath)) {
            deferredPromise.get(data.filePath)(data.metadata);
            deferredPromise.delete(data.filePath);
        }
    });
});
async function getMp3Tags(filePath) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject('File not found');
        }
        const METADATA = await new Promise((resolve, reject) => {
            deferredPromise.set(filePath, resolve);
            mmWorker?.postMessage(filePath);
        });
        let tags = {
            ID: stringHash(filePath),
            Extension: 'mp3',
            SourceFile: filePath
        };
        const STATS = fs.statSync(filePath);
        let nativeTags = mergeNatives(METADATA.native);
        let dateParsed = getDate(String(nativeTags.TDRC || nativeTags.TYER));
        tags.Album = nativeTags?.TALB || null;
        tags.AlbumArtist = nativeTags?.TPE2 || null;
        tags.Artist = nativeTags?.TPE1 || null;
        tags.Comment = nativeTags?.COMM?.text || null;
        tags.Composer = nativeTags?.TCOM || null;
        tags.Date_Year = dateParsed.year || null;
        tags.Date_Month = dateParsed.month || null;
        tags.Date_Day = dateParsed.day || null;
        tags.DiscNumber = Number(nativeTags?.TPOS) || null;
        tags.Genre = nativeTags?.TCON || null;
        tags.Rating = convertRating('Jahmin', nativeTags?.POPM?.rating) || null;
        tags.Title = nativeTags?.TIT2 || null;
        tags.Track = Number(nativeTags?.TRCK) || Number(nativeTags?.track) || null;
        tags.BitRate = METADATA.format.bitrate / 1000 || null;
        tags.Duration = (0, truncToDecimalPoint_fn_1.default)(METADATA.format.duration, 3) || null;
        tags.LastModified = STATS.mtimeMs;
        tags.SampleRate = METADATA.format.sampleRate || null;
        tags.Size = STATS.size;
        tags.PlayCount = 0;
        resolve(tags);
    });
}
exports.getMp3Tags = getMp3Tags;
function normalizeNewTags(newTags) {
    if (newTags.Title)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'Title', 'TIT2');
    if (newTags.Track)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'Track', 'TRCK');
    if (newTags.Album)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'Album', 'TALB');
    if (newTags.AlbumArtist)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'AlbumArtist', 'TPE2');
    if (newTags.Artist)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'Artist', 'TPE1');
    if (newTags.Composer)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'Composer', 'TCOM');
    if (newTags.DiscNumber)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'DiscNumber', 'TPOS');
    if (newTags.Genre)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'Genre', 'TCON');
    if (newTags.Comment)
        (0, renameObjectKey_fn_1.renameObjectKey)(newTags, 'Comment', 'comment');
    if (newTags.comment) {
        newTags.comment = {
            language: 'eng',
            text: newTags.comment
        };
    }
    if (newTags.Date_Year || newTags.Date_Month || newTags.Date_Day) {
        newTags.TDRC = `${newTags.Date_Year || '0000'}/${newTags.Date_Month || '00'}/${newTags.Date_Day || '00'}`;
        delete newTags.Date_Year;
        delete newTags.Date_Month;
        delete newTags.Date_Day;
    }
    if (newTags.Rating) {
        newTags.popularimeter = {
            email: 'foo@bar.baz',
            rating: convertRating('Mp3', newTags.Rating),
            counter: 0
        };
        // delete newTags.Rating
    }
    return newTags;
}
/**
 * @param {('Mp3' | 'Jahmin')} to - Mp3: Converts from (0 - 100) to (0 - 255) to save rating tag in file from renderer
 * @param {('Mp3' | 'Jahmin')} to - Jahmin: Converts from (0 - 255) to (0 - 100) for the renderer
 * @param {number} rating
 * @returns {*}  number | undefined
 */
function convertRating(to, rating) {
    if (!isNaN(rating)) {
        if (to === 'Mp3') {
            return Math.round((255 / 100) * rating); // Converts 100 Rating to 255
        }
        if (to === 'Jahmin') {
            return Math.round((100 / 255) * rating); // Converts 255 Rating to 100
        }
    }
    else {
        return undefined;
    }
}
function mergeNatives(native) {
    let finalObject = {};
    for (let key in native) {
        for (let value in native[key]) {
            if (finalObject[native[key][value]['id']]) {
                finalObject[native[key][value]['id']] = finalObject[native[key][value]['id']] + '//' + native[key][value]['value'];
            }
            else {
                finalObject[native[key][value]['id']] = native[key][value]['value'];
            }
        }
    }
    return finalObject;
}
// export function getMp3Tags(filePath: string): Promise<SongType> {
// 	return new Promise((resolve, reject) => {
// 		exec(`"${ffprobePath()}" -v error -of json -show_streams -show_format -i "${filePath}"`, (err, stdout, stderr) => {
// 			if (stdout) {
// 				let tags: SongType = {
// 					Extension: 'mp3'
// 				}
// 				let data = JSON.parse(stdout)
// 				let streamAudioData: StreamSongType = data['streams'].find((stream: StreamSongType) => stream['codec_type'] === 'audio')
// 				tags['SourceFile'] = filePath
// 				tags['SampleRate'] = Number(streamAudioData['sample_rate'])
// 				data = data['format']
// 				tags['BitRate'] = Number(data['bit_rate'])
// 				tags['Duration'] = Number(data['duration'])
// 				tags['Size'] = Number(data['size'])
// 				let dataTags = lowerCaseObjectKeys(data['tags'])
// 				let dateParsed = getDate(dataTags['date'] || dataTags['tyer'])
// 				tags['Rating'] = Number(dataTags['rating'])
// 				tags['Title'] = dataTags['title']
// 				tags['Artist'] = dataTags['artist']
// 				tags['Album'] = dataTags['album']
// 				tags['Genre'] = dataTags['genre']
// 				tags['Comment'] = dataTags['comment']
// 				tags['AlbumArtist'] = dataTags['album_artist']
// 				tags['Composer'] = dataTags['composer']
// 				tags['DiscNumber'] = dataTags['disc'] !== undefined ? Number(dataTags['disc']) : undefined
// 				tags['Date_Year'] = dateParsed['year']
// 				tags['Date_Month'] = dateParsed['month']
// 				tags['Date_Day'] = dateParsed['day']
// 				tags['Track'] = Number(dataTags['track'])
// 				tags['LastModified'] = fs.statSync(filePath).mtimeMs
// 				tags['ID'] = stringHash(filePath)
// 				resolve(tags)
// 			}
// 		})
// 	})
// }
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
