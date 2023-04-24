"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const equalizer_service_1 = require("../services/equalizer.service");
function default_1(ipcMain) {
    ipcMain.handle('update-equalizer-values', async (evt, eqHash, newValues) => {
        return (0, equalizer_service_1.updateEqualizerValues)(eqHash, newValues);
    });
}
exports.default = default_1;
