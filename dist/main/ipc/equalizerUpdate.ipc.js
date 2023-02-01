"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const equalizer_service_1 = require("../services/equalizer.service");
function default_1(ipcMain) {
    ipcMain.handle('update-equalizer-values', async (evt, eqName, newValues) => {
        return (0, equalizer_service_1.updateEqualizerValues)(eqName, newValues);
    });
}
exports.default = default_1;
