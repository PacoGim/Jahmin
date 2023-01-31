"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contextMenu_1 = require("../context_menu/contextMenu");
function default_1(ipcMain) {
    ipcMain.on('show-context-menu', (evt, menuToOpen, parameters) => (0, contextMenu_1.loadContextMenu)(evt, menuToOpen, parameters));
}
exports.default = default_1;
