"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
let isAppReady = false;
function default_1(ipcMain) {
    ipcMain.on('app-ready', () => {
        if (isAppReady === true)
            return;
        isAppReady = true;
        (0, sendWebContents_fn_1.default)('get-all-songs-from-renderer', undefined);
        registerGlobalShortcuts();
    });
}
exports.default = default_1;
function registerGlobalShortcuts() {
    let isMediaNextTrackRegistered = electron_1.globalShortcut.register('MediaNextTrack', () => {
        (0, sendWebContents_fn_1.default)('media-key-pressed', 'MediaNextTrack');
    });
    let isMediaPreviousTrackRegistered = electron_1.globalShortcut.register('MediaPreviousTrack', () => {
        (0, sendWebContents_fn_1.default)('media-key-pressed', 'MediaPreviousTrack');
    });
    let isMediaPlayPauseRegistered = electron_1.globalShortcut.register('MediaPlayPause', () => {
        (0, sendWebContents_fn_1.default)('media-key-pressed', 'MediaPlayPause');
    });
    if (isMediaNextTrackRegistered === false ||
        isMediaPreviousTrackRegistered === false ||
        isMediaPlayPauseRegistered === false) {
        (0, sendWebContents_fn_1.default)('global-shortcuts-registered', false);
    }
    else {
        (0, sendWebContents_fn_1.default)('global-shortcuts-registered', true);
    }
}
