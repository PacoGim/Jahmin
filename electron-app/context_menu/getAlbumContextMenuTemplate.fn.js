"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sendWebContents_service_1 = require("../services/sendWebContents.service");
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
            // reloadAlbumData(data.albumId)
        }
    });
    template.push({
        label: `Reload Album Art`,
        click: () => {
            if (data.albumId) {
                (0, sendWebContents_service_1.sendWebContents)('get-art-sizes', {
                    albumId: data.albumId
                });
            }
        }
    });
    return template;
}
exports.default = default_1;
