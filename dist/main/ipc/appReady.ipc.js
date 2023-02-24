"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
let isAppReady = false;
function default_1(ipcMain) {
    ipcMain.on('app-ready', () => {
        if (isAppReady === true)
            return;
        isAppReady = true;
        (0, sendWebContents_fn_1.default)('get-all-songs-from-renderer', undefined);
    });
}
exports.default = default_1;
