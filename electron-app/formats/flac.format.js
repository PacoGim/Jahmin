"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlacTags = exports.writeFlacTags = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const string_hash_1 = __importDefault(require("string-hash"));
let ffprobePath = () => {
    return path_1.default.join(__dirname, '../binaries', 'ffprobe');
};
function writeFlacTags(filePath, newTags) {
    return new Promise((resolve, reject) => {
        let ffmpegMetatagString = objectToFfmpegString(newTags);
        child_process_1.exec(`../binaries/ffmpeg -i "${filePath}"  -map 0 -y -codec copy -write_id3v2 1 ${ffmpegMetatagString} "./out/${filePath
            .split('/')
            .pop()}"`, (error, stdout, stderr) => {
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
        }).on('close', () => {
            resolve('Done');
        });
    });
}
exports.writeFlacTags = writeFlacTags;
function getFlacTags(filePath) {
    return new Promise((resolve, reject) => {
        child_process_1.exec(`"${ffprobePath()}" -v error -of json -show_streams -show_format -i "${filePath}"`, (err, stdout, stderr) => {
            if (stdout) {
                let tags = {
                    Extension: 'flac'
                };
                let data = JSON.parse(stdout);
                tags['ID'] = string_hash_1.default(filePath);
                let streamAudioData = data['streams'].find((stream) => stream['codec_type'] === 'audio');
                tags['SourceFile'] = filePath;
                tags['SampleRate'] = Number(streamAudioData['sample_rate']);
                tags['BitDepth'] = Number(streamAudioData['bits_per_raw_sample']);
                data = data['format'];
                tags['BitRate'] = Number(data['bit_rate']);
                tags['Duration'] = Number(data['duration']);
                tags['Size'] = Number(data['size']);
                let dataTags = lowerCaseObjectKeys(data['tags']);
                let dateParsed = getDate(dataTags['date']);
                tags['Rating'] = Number(dataTags['rating']);
                tags['Title'] = dataTags['title'];
                tags['Artist'] = dataTags['artist'];
                tags['Album'] = dataTags['album'];
                tags['Genre'] = dataTags['genre'];
                tags['Comment'] = dataTags['comment'];
                tags['AlbumArtist'] = dataTags['album_artist'];
                tags['Composer'] = dataTags['composer'];
                tags['DiscNumber'] = dataTags['disc'] !== undefined ? Number(dataTags['disc']) : undefined;
                tags['Date_Year'] = dateParsed['year'];
                tags['Date_Month'] = dateParsed['month'];
                tags['Date_Day'] = dateParsed['day'];
                tags['Track'] = Number(dataTags['track']);
                tags['LastModified'] = fs_1.default.statSync(filePath).mtimeMs;
                resolve(tags);
            }
            if (err) {
                console.log(err);
            }
        });
    });
}
exports.getFlacTags = getFlacTags;
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
