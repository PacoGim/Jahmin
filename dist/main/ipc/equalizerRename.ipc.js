"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const equalizer_service_1 = require("../services/equalizer.service");
function default_1(ipcMain) {
    ipcMain.handle('rename-equalizer', async (evt, eqName, newName) => {
        return (0, equalizer_service_1.renameEqualizer)(eqName, newName);
    });
}
exports.default = default_1;
