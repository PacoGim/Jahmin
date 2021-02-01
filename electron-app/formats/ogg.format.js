"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const lowerCaseObjectKeys_fn_1 = require("../functions/lowerCaseObjectKeys.fn");
const objectToFfmpegString_fn_1 = require("../functions/objectToFfmpegString.fn");
function getOggTags(filePath) {
    return new Promise((resolve, reject) => {
        child_process_1.exec(`./binaries/ffprobe -v error -of json -show_streams -show_format -i "${filePath}"`, (err, stdout, stderr) => {
            if (stdout) {
                let tags = {
                    Extension: 'ogg'
                };
                let data = JSON.parse(stdout);
                console.log(data);
                let streamAudioData = data['streams'].find((stream) => stream['codec_type'] === 'video');
                tags['SourceFile'] = filePath;
                tags['SampleRate'] = Number(streamAudioData['sample_rate']);
                tags['BitRate'] = Number(streamAudioData['bit_rate']);
                tags['BitDepth'] = Number(streamAudioData['bits_per_raw_sample']);
                data = data['format'];
                tags['Duration'] = Number(data['duration']);
                tags['Size'] = Number(data['size']);
                let dataTags = lowerCaseObjectKeys_fn_1.lowerCaseObjectKeys(streamAudioData['tags']);
                console.log(dataTags);
                tags['Rating'] = Number(dataTags['rating']);
                // tags['Rating'] = dataTags['rating']
                tags['Title'] = dataTags['title'];
                tags['Artist'] = dataTags['artist'];
                tags['Album'] = dataTags['album'];
                tags['Genre'] = dataTags['genre'];
                tags['Comment'] = dataTags['comment'];
                tags['AlbumArtist'] = dataTags['album_artist'];
                tags['Composer'] = dataTags['composer'];
                tags['DiscNumber'] = dataTags['disc'];
                tags['Year'] = Number(dataTags['date']);
                tags['Date'] = dataTags['date'];
                tags['Track'] = dataTags['track'];
                tags['LastModified'] = fs_1.default.statSync(filePath).mtimeMs;
                // console.log(tags)
            }
        });
    });
}
function writeOggTags(filePath) {
    return new Promise((resolve, reject) => {
        let ffmpegMetatagString = objectToFfmpegString_fn_1.objectToFfmpegString({
            title: 'New Title',
            rating: 90,
            track: 301,
            album: 'New Album',
            artist: 'New Artist',
            album_artist: 'New Album Artist',
            composer: 'New Composer',
            genre: 'New Genre',
            year: 2002,
            date: '2008',
            comment: 'New Comment',
            disc: 9
        });
        child_process_1.exec(`./binaries/ffmpeg -i "${filePath}"  -map 0 -y -codec:a copy ${ffmpegMetatagString} "./out/${filePath
            .split('/')
            .pop()}"`, (error, stdout, stderr) => {
            if (error) {
                // console.log(error)
            }
            if (stdout) {
                // console.log(stdout)
            }
            if (stderr) {
                console.log(stderr);
                resolve('');
            }
        });
    });
}
