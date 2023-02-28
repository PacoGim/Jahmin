"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const verifyFolderTegrity_fn_1 = __importDefault(require("../functions/verifyFolderTegrity.fn"));
const addSeparator_fn_1 = __importDefault(require("./functions/addSeparator.fn"));
function default_1(data) {
    let template = [];
    template.push({
        label: `Show Folder`,
        click: () => {
            electron_1.shell.openPath(data.albumRootDir || '');
        }
    });
    (0, addSeparator_fn_1.default)(template);
    template.push({
        label: 'Play Now',
        click: () => {
            (0, sendWebContents_fn_1.default)('album-play-now', {
                songList: data.songList,
                clickedAlbum: data.albumRootDir,
                selectedAlbumsDir: data.selectedAlbumsDir
            });
        }
    });
    template.push({
        label: 'Add to Playback',
        click: () => {
            (0, sendWebContents_fn_1.default)('album-add-to-playback', data.songList);
        }
    });
    template.push({
        label: 'Play After',
        click: () => {
            (0, sendWebContents_fn_1.default)('album-play-after', data.songList);
        }
    });
    (0, addSeparator_fn_1.default)(template);
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
