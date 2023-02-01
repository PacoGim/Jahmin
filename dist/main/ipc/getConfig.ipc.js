"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_service_1 = require("../services/config.service");
function default_1(ipcMain) {
    ipcMain.handle('get-config', config_service_1.getConfig);
}
exports.default = default_1;
