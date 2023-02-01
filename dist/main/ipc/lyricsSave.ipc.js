"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lyrics_service_1 = require("../services/lyrics.service");
function default_1(ipcMain) {
    ipcMain.handle('save-lyrics', async (evt, lyrics, songTile, songArtist) => {
        return await (0, lyrics_service_1.saveLyrics)(lyrics, songTile, songArtist);
    });
}
exports.default = default_1;
