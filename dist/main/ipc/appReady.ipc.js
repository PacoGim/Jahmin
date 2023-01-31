"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appReady_service_1 = __importDefault(require("../services/appReady.service"));
function default_1(ipcMain) {
    ipcMain.on('app-ready', appReady_service_1.default);
}
exports.default = default_1;
