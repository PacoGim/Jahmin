"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const equalizer_service_1 = require("../services/equalizer.service");
function default_1(ipcMain) {
    ipcMain.handle('delete-equalizer', async (evt, eqName) => {
        return (0, equalizer_service_1.deleteEqualizer)(eqName);
    });
}
exports.default = default_1;
