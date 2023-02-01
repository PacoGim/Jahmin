"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const equalizer_service_1 = require("../services/equalizer.service");
function default_1(ipcMain) {
    ipcMain.handle('add-new-equalizer-profile', async (evt, newProfile) => {
        return (0, equalizer_service_1.addEqualizer)(newProfile);
    });
}
exports.default = default_1;
