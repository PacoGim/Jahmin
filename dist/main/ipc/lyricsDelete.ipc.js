"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lyrics_service_1 = require("../services/lyrics.service");
function default_1(ipcMain) {
    ipcMain.handle('delete-lyrics', async (evt, title, artist) => {
        return await (0, lyrics_service_1.deleteLyrics)(title, artist);
    });
}
exports.default = default_1;
