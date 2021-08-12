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
exports.getMp3Tags = exports.writeMp3Tags = void 0;
const fs_1 = __importDefault(require("fs"));
const string_hash_1 = __importDefault(require("string-hash"));
const renameObjectKey_fn_1 = require("../functions/renameObjectKey.fn");
const worker_service_1 = require("../services/worker.service");
/********************** Write Mp3 Tags **********************/
let tagWriteDeferredPromise = undefined;
let nodeId3Worker = (_a = worker_service_1.getWorker('nodeID3')) === null || _a === void 0 ? void 0 : _a.on('message', (response) => {
    tagWriteDeferredPromise(response);
});
function writeMp3Tags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        newTags = normalizeNewTags(newTags);
        tagWriteDeferredPromise = resolve;
        nodeId3Worker === null || nodeId3Worker === void 0 ? void 0 : nodeId3Worker.postMessage({ filePath, newTags });
    });
}
exports.writeMp3Tags = writeMp3Tags;
/********************** Get Mp3 Tags **********************/
let worker = worker_service_1.getWorker('musicMetadata');
let deferredPromise = new Map();
worker === null || worker === void 0 ? void 0 : worker.on('message', (data) => {
    if (deferredPromise.has(data.filePath)) {
        deferredPromise.get(data.filePath)(data.metadata);
        deferredPromise.delete(data.filePath);
    }
});
function getMp3Tags(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const METADATA = yield new Promise((resolve, reject) => {
                deferredPromise.set(filePath, resolve);
                worker === null || worker === void 0 ? void 0 : worker.postMessage(filePath);
            });
            let tags = {
                ID: string_hash_1.default(filePath),
                Extension: 'mp3',
                SourceFile: filePath
            };
            const STATS = fs_1.default.statSync(filePath);
            let nativeTags = mergeNatives(METADATA.native);
            let dateParsed = getDate(String(nativeTags.TDRC || nativeTags.TYER));
            tags.Album = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TALB) || '';
            tags.AlbumArtist = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TPE2) || '';
            tags.Artist = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TPE1) || '';
            tags.Comment = ((_a = nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.COMM) === null || _a === void 0 ? void 0 : _a.text) || '';
            tags.Composer = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TCOM) || '';
            tags.Date_Year = dateParsed.year || null;
            tags.Date_Month = dateParsed.month || null;
            tags.Date_Day = dateParsed.day || null;
            tags.DiscNumber = Number(nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TPOS) || null;
            tags.Genre = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TCON) || '';
            tags.Rating = convertRating('Jahmin', (_b = nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.POPM) === null || _b === void 0 ? void 0 : _b.rating) || 0;
            tags.Title = (nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TIT2) || '';
            tags.Track = Number(nativeTags === null || nativeTags === void 0 ? void 0 : nativeTags.TRCK) || 0;
            tags.BitRate = METADATA.format.bitrate / 1000;
            tags.Duration = Math.trunc(METADATA.format.duration);
            tags.LastModified = STATS.mtimeMs;
            tags.SampleRate = METADATA.format.sampleRate;
            tags.Size = STATS.size;
            resolve(tags);
        }));
    });
}
exports.getMp3Tags = getMp3Tags;
function normalizeNewTags(newTags) {
    if (newTags.Title)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Title', 'TIT2');
    if (newTags.Track)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Track', 'TRCK');
    if (newTags.Album)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Album', 'TALB');
    if (newTags.AlbumArtist)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'AlbumArtist', 'TPE2');
    if (newTags.Artist)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Artist', 'TPE1');
    if (newTags.Composer)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Composer', 'TCOM');
    if (newTags.DiscNumber)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'DiscNumber', 'TPOS');
    if (newTags.Genre)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Genre', 'TCON');
    if (newTags.Comment)
        renameObjectKey_fn_1.renameObjectKey(newTags, 'Comment', 'comment');
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
        delete newTags.Rating;
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
