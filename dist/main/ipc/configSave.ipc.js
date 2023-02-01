"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_service_1 = require("../services/config.service");
function default_1(ipcMain) {
    ipcMain.handle('save-config', (evt, newConfig) => {
        return (0, config_service_1.saveConfig)(newConfig);
    });
}
exports.default = default_1;
