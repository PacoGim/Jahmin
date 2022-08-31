"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
function default_1() {
    return (0, path_1.join)(electron_1.app.getPath('appData'), 'Jahmin/App Data');
}
exports.default = default_1;
