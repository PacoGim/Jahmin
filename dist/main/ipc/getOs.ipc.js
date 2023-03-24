"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getOs_fn_1 = __importDefault(require("../../functions/getOs.fn"));
function default_1(ipcMain) {
    ipcMain.handle('get-os', getOs_fn_1.default);
}
exports.default = default_1;
