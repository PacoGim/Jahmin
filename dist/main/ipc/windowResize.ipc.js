"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const config_service_1 = require("../services/config.service");
let saveConfigDebounce;
function default_1(ipcMain) {
    ipcMain.on('window-resize', event => windowResize(event));
}
exports.default = default_1;
function windowResize(event) {
    let window = electron_1.BrowserWindow.fromId(event.frameId);
    if (window === null)
        return;
    clearTimeout(saveConfigDebounce);
    console.log(window.isFullScreen());
    saveConfigDebounce = setTimeout(() => {
        (0, config_service_1.saveConfig)({
            bounds: {
                x: window.getPosition()[0],
                y: window.getPosition()[1],
                width: window.getSize()[0],
                height: window.getSize()[1]
            }
        });
    }, 250);
}
