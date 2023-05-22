"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { shell } = require('electron');
function default_1(ipcMain) {
    ipcMain.on('open-genius-webpage', (evt, songTitle, songArtist) => {
        shell.openExternal(`https://genius.com/search?q=${songTitle} ${songArtist}`);
    });
}
exports.default = default_1;
