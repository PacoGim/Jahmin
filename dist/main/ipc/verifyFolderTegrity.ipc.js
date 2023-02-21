"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verifyFolderTegrity_fn_1 = __importDefault(require("../functions/verifyFolderTegrity.fn"));
function default_1(ipcMain) {
    ipcMain.on('verify-folder-tegrity', (evt, folderRoot) => {
        (0, verifyFolderTegrity_fn_1.default)(folderRoot);
    });
}
exports.default = default_1;
