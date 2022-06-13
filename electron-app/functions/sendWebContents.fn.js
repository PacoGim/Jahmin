"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWebContents = void 0;
const __1 = require("..");
let browserWindow;
function sendWebContents(channel, data) {
    if (browserWindow === undefined) {
        browserWindow = (0, __1.getMainWindow)();
    }
    browserWindow.webContents.send(channel, data);
}
exports.sendWebContents = sendWebContents;
