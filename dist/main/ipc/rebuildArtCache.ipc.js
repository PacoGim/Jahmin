"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clearArtCache_fn_1 = __importDefault(require("../functions/clearArtCache.fn"));
function default_1(ipcMain) {
    ipcMain.handle('rebuild-art-cache', async (evt) => {
        return await (0, clearArtCache_fn_1.default)();
    });
}
exports.default = default_1;
