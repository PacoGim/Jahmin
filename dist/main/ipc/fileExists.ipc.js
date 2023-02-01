"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fileExists_fn_1 = __importDefault(require("../functions/fileExists.fn"));
function default_1(ipcMain) {
    ipcMain.handle('file-exists', async (evt, filePath) => {
        return (0, fileExists_fn_1.default)(filePath);
    });
}
exports.default = default_1;
