"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const directoryHandler_service_1 = __importDefault(require("../services/directoryHandler.service"));
function default_1(ipcMain) {
    ipcMain.on('select-directories', (evt, type, dbSongs) => {
        electron_1.dialog
            .showOpenDialog({
            properties: ['openDirectory', 'multiSelections']
        })
            .then(result => {
            if (result.canceled === false) {
                (0, directoryHandler_service_1.default)(result.filePaths, type, dbSongs);
            }
        })
            .catch(err => {
            console.log(err);
        });
    });
}
exports.default = default_1;
