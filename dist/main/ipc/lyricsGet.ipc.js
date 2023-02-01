"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lyrics_service_1 = require("../services/lyrics.service");
function default_1(ipcMain) {
    ipcMain.handle('get-lyrics', async (evt, songTile, songArtist) => {
        return await (0, lyrics_service_1.getLyrics)(songTile, songArtist);
    });
}
exports.default = default_1;
