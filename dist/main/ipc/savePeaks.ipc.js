"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const peaks_service_1 = require("../services/peaks.service");
function default_1(ipcMain) {
    ipcMain.on('save-peaks', (evt, sourceFile, peaks) => (0, peaks_service_1.savePeaks)(sourceFile, peaks));
}
exports.default = default_1;
