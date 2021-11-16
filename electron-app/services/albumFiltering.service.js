"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewPromiseAlbumArray = exports.getAlbumArray = exports.setAlbumArray = void 0;
const hashString_fn_1 = require("../functions/hashString.fn");
let albumArray = [];
// External resolve. When resolve result set, the promise will be resolved.
let resolvePromise = null;
function setAlbumArray(newAlbumArray) {
    // Saves the new album array for future use.
    albumArray = newAlbumArray;
    let newArray = [];
    // Group Songs by root folder
    newAlbumArray.forEach((song) => {
        let rootDir = song['SourceFile'].split('/').slice(0, -1).join('/');
        let foundAlbum = newArray.find((i) => i['RootDir'] === rootDir);
        if (!foundAlbum) {
            newArray.push({
                ID: (0, hashString_fn_1.hash)(rootDir),
                Name: song['Album'],
                RootDir: rootDir,
                AlbumArtist: song['AlbumArtist'],
                DynamicAlbumArtist: getAllAlbumArtists(newAlbumArray, song['Album']),
                Songs: [song]
            });
        }
        else {
            foundAlbum['Songs'].push(song);
        }
    });
    albumArray = newArray;
    // Sets the external promise resolve result.
    resolvePromise(newArray);
}
exports.setAlbumArray = setAlbumArray;
// Iterates through every song of an album to get every single artist, then sorts them by the amount of songs done by artist, the more an artist has songs the firstest it will be in the array.
function getAllAlbumArtists(songArray, album) {
    let artistsCount = [];
    let artistsConcat = [];
    let artistsSorted = '';
    songArray.forEach((song) => {
        if (song['Album'] === album) {
            let artists = splitArtists(song['Artist']);
            if (artists.length > 0) {
                artistsConcat.push(...artists);
            }
            else {
                artistsConcat = artists;
            }
        }
    });
    artistsConcat.forEach((artist) => {
        let foundArtist = artistsCount.find((i) => i['Artist'] === artist);
        if (foundArtist) {
            foundArtist['Count']++;
        }
        else {
            artistsCount.push({
                Artist: artist,
                Count: 0
            });
        }
    });
    artistsCount = artistsCount.sort((a, b) => b['Count'] - a['Count']);
    artistsSorted = artistsCount.map((a) => a['Artist']).join(', ');
    return artistsSorted;
}
function splitArtists(artists) {
    if (artists) {
        let artistSplit = [];
        if (typeof artists === 'string') {
            artistSplit = artists.split(', ');
            artistSplit = artists.split(',');
        }
        return artistSplit;
    }
    return [];
}
function getAlbumArray() {
    return albumArray;
}
exports.getAlbumArray = getAlbumArray;
// Retuns a new Promise so it can be called anywhere in the app and will be resolved whenever the Promise external resolve is completed.
function getNewPromiseAlbumArray() {
    return new Promise((resolve) => (resolvePromise = resolve));
}
exports.getNewPromiseAlbumArray = getNewPromiseAlbumArray;
