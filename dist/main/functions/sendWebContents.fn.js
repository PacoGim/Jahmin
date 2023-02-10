"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
let browserWindow;
function default_1(channel, data) {
    if (browserWindow === undefined) {
        browserWindow = (0, main_1.getMainWindow)();
    }
    try {
        browserWindow?.webContents.send(channel, data);
    }
    catch (error) { }
}
exports.default = default_1;
