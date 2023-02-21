"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const verifyFolderTegrity_fn_1 = __importDefault(require("../functions/verifyFolderTegrity.fn"));
function default_1(data) {
    let template = [];
    template.push({
        label: `Show Folder`,
        click: () => {
            electron_1.shell.openPath(data.albumRootDir || '');
        }
    });
    template.push({
        label: `Reload Album Data`,
        click: () => {
            if (data.albumRootDir)
                (0, verifyFolderTegrity_fn_1.default)(data.albumRootDir);
        }
    });
    template.push({
        label: `Reload Album Art`,
        click: () => {
            if (data.albumId) {
                (0, sendWebContents_fn_1.default)('get-art-sizes', {
                    albumId: data.albumId
                });
            }
        }
    });
    return template;
}
exports.default = default_1;
