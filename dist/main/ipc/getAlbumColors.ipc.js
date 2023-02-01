"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAlbumColors_fn_1 = require("../functions/getAlbumColors.fn");
function default_1(ipcMain) {
    ipcMain.handle('get-album-colors', async (evt, rootDir, contrastRatio) => await (0, getAlbumColors_fn_1.getAlbumColors)(rootDir, contrastRatio));
}
exports.default = default_1;
