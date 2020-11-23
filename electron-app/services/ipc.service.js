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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadIPC = void 0;
const electron_1 = require("electron");
const config_service_1 = require("./config.service");
const loki_service_1 = require("./loki.service");
const songFilter_service_1 = require("./songFilter.service");
function loadIPC() {
    electron_1.ipcMain.handle('get-songs', (evt, arg) => __awaiter(this, void 0, void 0, function* () {
        // let index = await createFilesIndex(collectionName)
        // scanFolders(collectionName,['/Volumes/Maxtor/Music'])
        // return index
        let docs = loki_service_1.getCollection();
        return docs;
    }));
    electron_1.ipcMain.handle('get-order', (evt, arg) => __awaiter(this, void 0, void 0, function* () {
        let config = config_service_1.getConfig();
        let grouping = config['order']['grouping'] || [];
        let filtering = config['order']['filtering'] || [];
        let result = songFilter_service_1.orderSongs(arg, grouping, filtering);
        return result;
    }));
    electron_1.ipcMain.handle('get-config', (evt, arg) => __awaiter(this, void 0, void 0, function* () {
        let config = config_service_1.getConfig();
        return config;
    }));
    electron_1.ipcMain.handle('open-config', () => {
        console.log('Open Config File');
        // shell.showItemInFolder(configFilePath)
        return;
    });
}
exports.loadIPC = loadIPC;
