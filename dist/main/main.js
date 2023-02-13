"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainWindow = void 0;
const electron_1 = require("electron");
const chokidar_1 = require("chokidar");
const config_service_1 = require("./services/config.service");
const getWindowOptions_fn_1 = __importDefault(require("./functions/getWindowOptions.fn"));
const ipc_service_1 = require("./services/ipc.service");
const path_1 = __importDefault(require("path"));
const calculateWindowBoundaries_fn_1 = __importDefault(require("./functions/calculateWindowBoundaries.fn"));
let browserWindow;
(0, chokidar_1.watch)([path_1.default.join(__dirname, '../svelte'), path_1.default.join(__dirname, '../index.html'), path_1.default.join(__dirname, '../assets')]).on('change', () => {
    getMainWindow().reload();
});
function createWindow() {
    const config = (0, config_service_1.getConfig)();
    browserWindow = new electron_1.BrowserWindow((0, getWindowOptions_fn_1.default)(config));
    browserWindow.webContents.openDevTools();
    browserWindow.loadFile(path_1.default.join(__dirname, '../index.html'));
    browserWindow
        .on('move', () => (0, calculateWindowBoundaries_fn_1.default)(browserWindow))
        .on('resize', () => (0, calculateWindowBoundaries_fn_1.default)(browserWindow));
}
electron_1.app.whenReady().then(() => {
    createWindow();
    (0, ipc_service_1.startIPC)();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
    electron_1.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin')
            electron_1.app.quit();
    });
});
function getMainWindow() {
    return browserWindow;
}
exports.getMainWindow = getMainWindow;
