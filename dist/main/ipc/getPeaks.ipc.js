"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const peaks_service_1 = require("../services/peaks.service");
function default_1(ipcMain) {
    ipcMain.handle('get-peaks', async (evt, sourceFile) => await (0, peaks_service_1.getPeaks)(sourceFile));
}
exports.default = default_1;
