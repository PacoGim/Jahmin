"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const librarySongs_service_1 = require("../services/librarySongs.service");
function default_1(ipcMain) {
    ipcMain.handle('stop-song-update', async (evt) => {
        return await (0, librarySongs_service_1.stopSongsUpdating)();
    });
}
exports.default = default_1;
