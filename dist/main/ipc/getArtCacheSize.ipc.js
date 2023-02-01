"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getArtCacheSize_fn_1 = __importDefault(require("../functions/getArtCacheSize.fn"));
function default_1(ipcMain) {
    ipcMain.handle('get-art-cache-size', async () => {
        return (0, getArtCacheSize_fn_1.default)();
    });
}
exports.default = default_1;
