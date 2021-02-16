"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAacTags = void 0;
const exiftool_vendored_1 = require("exiftool-vendored");
const exiftool = new exiftool_vendored_1.ExifTool({ taskTimeoutMillis: 5000 });
const fs_1 = __importDefault(require("fs"));
const string_hash_1 = __importDefault(require("string-hash"));
function writeAacTags(filePath, newTags) {
    exiftool.write(filePath, {
        //@ts-expect-error
        Album: 'New Album',
        AlbumArtist: 'New Album Artist',
        Artist: 'New Artist',
        Composer: 'New Composer',
        ContentCreateDate: new Date(),
        Genre: 'New Genre',
        Title: 'New Title',
        TrackNumber: 258,
        RatingPercent: 95,
        Comment: 'New Comment'
    });
    // let time = DateTime.fromISO('1999-01-01T01:01').toFormat('yyyy:mm:dd HH:MM:ss')
}
function getAacTags(filePath) {
    return new Promise((resolve, reject) => {
        exiftool.read(filePath).then((tags) => {
            // console.log(tags)
            let fileStats = fs_1.default.statSync(filePath);
            resolve({
                ID: string_hash_1.default(filePath),
                //@ts-expect-error
                Album: tags['Album'],
                //@ts-expect-error
                AlbumArtist: tags['AlbumArtist'],
                Artist: tags['Artist'],
                //@ts-expect-error
                Composer: tags['Composer'],
                //@ts-expect-error
                Date: tags['ContentCreateDate'],
                //@ts-expect-error
                Genre: tags['Genre'],
                //@ts-expect-error
                DiskNumber: tags['DiskNumber'],
                Title: tags['Title'],
                //@ts-expect-error
                Track: getTrack(tags['TrackNumber'], tags['Track']),
                Rating: tags['RatingPercent'],
                //@ts-expect-error
                // Year: DateTime.fromISO(tags['ContentCreateDate']['rawValue']).toFormat('YYYY'),
                Year: tags['ContentCreateDate'],
                Comment: tags['Comment'],
                SourceFile: tags['SourceFile'],
                Extension: tags['FileTypeExtension'],
                Size: fileStats.size,
                Duration: tags['Duration'],
                SampleRate: tags['AudioSampleRate'],
                LastModified: fileStats.mtimeMs,
                BitRate: tags['AvgBitrate'],
                BitDepth: tags['AudioBitsPerSample']
            });
        });
    });
}
exports.getAacTags = getAacTags;
function getDate() {
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
