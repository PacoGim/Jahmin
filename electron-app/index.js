"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainWindow = exports.appDataPath = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const appDataPath = () => path_1.default.join(electron_1.app.getPath('appData'), 'Jahmin');
exports.appDataPath = appDataPath;
const config_service_1 = require("./services/config.service");
const worker_service_1 = require("./services/worker.service");
(0, worker_service_1.initWorkers)();
const ipc_service_1 = require("./services/ipc.service");
(0, ipc_service_1.loadIPC)();
const storage_service_1 = require("./services/storage.service");
const songSync_service_1 = require("./services/songSync.service");
const chokidar_1 = __importDefault(require("chokidar"));
let browserWindow;
// Watches for changes in svelte build folder and reloads the window. Kinda hot reload-ish. Works Great!
chokidar_1.default.watch(path_1.default.join(__dirname, './build/bundle.js')).on('change', path => {
    getMainWindow().reload();
});
function createMainWindow() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = (0, config_service_1.getConfig)();
        // Create the browser window.
        browserWindow = new electron_1.BrowserWindow(loadOptions(config));
        browserWindow.webContents.openDevTools();
        browserWindow.loadFile('index.html');
        // Gets the storage data from files and creates a map.
        (0, storage_service_1.initStorage)();
        browserWindow.on('resize', () => saveWindowBounds(browserWindow)).on('move', () => saveWindowBounds(browserWindow));
    });
}
function loadOptions(config) {
    const options = {
        title: 'Jahmin',
        x: 0,
        y: 0,
        width: 800,
        height: 800,
        backgroundColor: '#1c2128',
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    };
    if (config.bounds !== undefined) {
        const bounds = config.bounds;
        const area = electron_1.screen.getDisplayMatching(bounds).workArea;
        if (bounds.x >= area.x &&
            bounds.y >= area.y &&
            bounds.x + bounds.width <= area.x + area.width &&
            bounds.y + bounds.height <= area.y + area.height) {
            options.x = bounds.x;
            options.y = bounds.y;
        }
        else {
            options.x = 0;
            options.y = 0;
        }
        if (bounds.width <= area.width && bounds.height <= area.height && bounds.height >= 500 && bounds.width >= 500) {
            options.height = bounds.height;
            options.width = bounds.width;
        }
    }
    return options;
}
function getMainWindow() {
    return browserWindow;
}
exports.getMainWindow = getMainWindow;
electron_1.app.on('ready', createMainWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    var _a;
    (0, worker_service_1.killAllWorkers)();
    (0, storage_service_1.killStorageWatcher)();
    (_a = (0, songSync_service_1.getRootDirFolderWatcher)()) === null || _a === void 0 ? void 0 : _a.close();
});
// process.on('exit',()=>{
// })
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
let saveConfigDebounce;
function saveWindowBounds(window) {
    if (saveConfigDebounce)
        clearTimeout(saveConfigDebounce);
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
