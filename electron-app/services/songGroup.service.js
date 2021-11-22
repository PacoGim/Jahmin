"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupSongs = void 0;
const sendWebContents_service_1 = require("./sendWebContents.service");
const storage_service_1 = require("./storage.service");
function groupSongs(groups, groupValues) {
    let songs = (0, storage_service_1.getStorageMapToArray)();
    groups = normalizeGroupNames(groups);
    groups.forEach((group, index) => {
        runGroupSongs(songs, groups, groupValues, index);
    });
}
exports.groupSongs = groupSongs;
function runGroupSongs(songs, groups, groupValues, index) {
    // console.log(groups, groupValues, index)
    // console.log(groups[index], groupValues[index], index)
    // songs = songs.slice(0, 10)
    /*
    Row 1 Since is the first row, we can just distinct Year since it is not based of the previous selected value.
    1999
    2000
    • 2001
    2002

    Row 2 Show songs with year 2001 and group extensions
    mp3 from 2001
    • flac from 2001
    opus from 2001

    Row 3
    Electronic flacs from 2001
    Rap flacs from 2001
    • Alternative flacs from 2001

    Send all songs/albums that match all previous selections.
    -> Songs from 2001, that are flac format, and have a genre of Alternative.
  */
    let groupedSongs = [];
    if (index === 0) {
        (0, sendWebContents_service_1.sendWebContents)('group-songs', {
            index,
            data: Array.from(new Set(songs.map(song => song[groups[index]])))
        });
        return;
    }
    // groupedSongs=groupSongsByValue(songs: SongType[], groups: string[], groupValues: string[], index: number)
    // console.log(groups, groupValues)
    groupedSongs = groupSongsByValue(songs, groups, groupValues, index);
    // console.log(groupedSongs)
    let groupedValues = [];
    groupedSongs.forEach(song => {
        let value = song[groups[index]];
        if (!groupedValues.includes(value)) {
            groupedValues.push(value);
        }
    });
    // console.log(groupedSongs)
    (0, sendWebContents_service_1.sendWebContents)('group-songs', {
        index,
        // data: groupedSongs
        data: groupedValues
    });
}
function groupSongsByValue(songs, groups, groupValues, index) {
    let groupedSongs = songs;
    groups.forEach((group, groupIndex) => {
        if (groupIndex >= index) {
            return;
        }
        groupedSongs = groupedSongs.filter(song => {
            if (groupValues[groupIndex] === undefined || groupValues[groupIndex] === 'undefined') {
                return true;
            }
            if (song[group] === groupValues[groupIndex]) {
                return true;
            }
            else {
                return false;
            }
        });
    });
    return groupedSongs;
}
function normalizeGroupNames(groups) {
    groups = groups.map(group => {
        switch (group) {
            case 'Album Artist':
                return 'AlbumArtist';
            default:
                return group;
        }
    });
    return groups;
}
