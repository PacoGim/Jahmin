"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupSongs = void 0;
const loki_service_1 = require("../services/loki.service");
const nanoid_1 = require("nanoid");
const nanoid = nanoid_1.customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);
function groupSongs(valueToGroupBy) {
    let songs = loki_service_1.getCollection();
    let groups = [];
    for (let song of songs) {
        let songValue = song[valueToGroupBy];
        if (!groups.includes(songValue)) {
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
