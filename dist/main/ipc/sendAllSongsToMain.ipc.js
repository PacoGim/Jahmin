"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const librarySongs_service_1 = require("../services/librarySongs.service");
function default_1(ipcMain) {
    ipcMain.on('send-all-songs-to-main', (evt, songsDb) => (0, librarySongs_service_1.fetchSongsTag)(songsDb));
}
exports.default = default_1;
