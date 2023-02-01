"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const equalizer_service_1 = require("../services/equalizer.service");
function default_1(ipcMain) {
    ipcMain.handle('get-equalizers', async (evt) => (0, equalizer_service_1.getEqualizers)());
}
exports.default = default_1;
