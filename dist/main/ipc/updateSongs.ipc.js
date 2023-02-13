"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_service_1 = require("../services/chokidar.service");
const librarySongs_service_1 = require("../services/librarySongs.service");
function default_1(ipcMain) {
    ipcMain.on('update-songs', (evt, songs, newTags) => {
        songs.forEach(song => {
            (0, chokidar_service_1.unwatchPaths)([song.SourceFile]);
            (0, librarySongs_service_1.addToTaskQueue)(song.SourceFile, 'update', newTags);
        });
    });
}
exports.default = default_1;
