"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupSongs = void 0;
// import { getCollection } from '../services/loki.service.bak'
const nanoid_1 = require("nanoid");
const storage_service_1 = require("../services/storage.service");
const nanoid = nanoid_1.customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);
// Gets the value to group by avery song with.
// For Example, Genre, Group every song with the same Genre.
function groupSongs(valueToGroupBy) {
    let songs = storage_service_1.getStorageMapToArray();
    let groups = [];
    for (let song of songs) {
        let songValue = song[valueToGroupBy];
        if (!groups.includes(String(songValue))) {
            groups.push(songValue);
        }
    }
    return groups
        .map((i) => {
        return {
            id: nanoid(),
            name: i
        };
    })
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}
exports.groupSongs = groupSongs;
