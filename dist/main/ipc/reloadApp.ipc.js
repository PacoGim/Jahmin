"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
function default_1(ipcMain) {
    ipcMain.on('reload-app', () => {
        (0, main_1.getMainWindow)().reload();
    });
}
exports.default = default_1;
