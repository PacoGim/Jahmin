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
exports.appDataPath = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const appDataPath = () => path_1.default.join(electron_1.app.getPath('appData'), 'Jahmin');
exports.appDataPath = appDataPath;
const config_service_1 = require("./services/config.service");
const worker_service_1 = require("./services/worker.service");
worker_service_1.initWorkers();
const ipc_service_1 = require("./services/ipc.service");
ipc_service_1.loadIPC();
const loki_service_1 = require("./services/loki.service");
const folderWatcher_service_1 = require("./services/folderWatcher.service");
const getWaveform_fn_1 = require("./functions/getWaveform.fn");
function createWindow() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = config_service_1.getConfig();
        yield loki_service_1.loadDb();
        // Create the browser window.
        const window = new electron_1.BrowserWindow(loadOptions(config));
        window.webContents.openDevTools();
        window.loadFile('index.html');
        if (config === null || config === void 0 ? void 0 : config['rootDirectories'])
            folderWatcher_service_1.watchFolders(config['rootDirectories']);
        window.on('resize', () => saveWindowBounds(window)).on('move', () => saveWindowBounds(window));
    });
}
function loadOptions(config) {
    const options = {
        title: 'Jahmin',
        x: 0,
        y: 0,
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    };
    if (config['bounds'] !== undefined) {
        const bounds = config['bounds'];
        const area = electron_1.screen.getDisplayMatching(bounds).workArea;
        if (bounds.x >= area.x &&
            bounds.y >= area.y &&
            bounds.x + bounds.width <= area.x + area.width &&
            bounds.y + bounds.height <= area.y + area.height) {
            options['x'] = bounds['x'];
            options['y'] = bounds['y'];
        }
        if (bounds.width <= area.width || bounds.height <= area.height) {
            options['height'] = bounds['height'];
            options['width'] = bounds['width'];
        }
    }
    else {
        console.log('No Config');
    }
    return options;
}
electron_1.ipcMain.on('show-context-menu', (event, menuToOpen, parameters = {}) => {
    let template = [];
    parameters = JSON.parse(parameters);
    if (menuToOpen === 'AlbumContextMenu') {
        let album = loki_service_1.getCollectionMap().get(parameters.albumID);
        template = [
            {
                label: `Open ${(album === null || album === void 0 ? void 0 : album.Name) || ''} Folder`,
                click: () => {
                    electron_1.shell.showItemInFolder((album === null || album === void 0 ? void 0 : album.RootDir) || '');
                }
            }
        ];
    }
    const menu = electron_1.Menu.buildFromTemplate(template);
    //@ts-expect-error
    menu.popup(electron_1.BrowserWindow.fromWebContents(event.sender));
});
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    var _a, _b;
    (_a = folderWatcher_service_1.getRootDirFolderWatcher()) === null || _a === void 0 ? void 0 : _a.close();
    (_b = getWaveform_fn_1.getWaveformsFolderWatcher()) === null || _b === void 0 ? void 0 : _b.close();
});
// process.on('exit',()=>{
// })
electron_1.app.on('activate', () => {
    // console.log(app.getPath('appData'))
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
let saveConfigDebounce;
function saveWindowBounds(window) {
    if (saveConfigDebounce)
        clearTimeout(saveConfigDebounce);
    saveConfigDebounce = setTimeout(() => {
        config_service_1.saveConfig({
            bounds: {
                x: window.getPosition()[0],
                y: window.getPosition()[1],
                width: window.getSize()[0],
                height: window.getSize()[1]
            }
        });
    }, 250);
}
