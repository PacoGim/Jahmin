"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const directoryHandler_service_1 = __importDefault(require("../services/directoryHandler.service"));
function default_1(ipcMain) {
    ipcMain.on('remove-directory', (evt, directory, type, dbSongs) => {
        (0, directoryHandler_service_1.default)([directory], type, dbSongs);
    });
}
exports.default = default_1;
