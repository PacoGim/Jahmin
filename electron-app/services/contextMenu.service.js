"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextMenu = void 0;
const electron_1 = require("electron");
const albumArt_service_1 = require("./albumArt.service");
const songSync_service_1 = require("./songSync.service");
const storage_service_1 = require("./storage.service");
function loadContextMenu(event, menuToOpen, parameters) {
    let template = [];
    parameters = JSON.parse(parameters);
    if (menuToOpen === 'AlbumContextMenu') {
        template = getAlbumContextMenuTemplate(parameters.albumId);
    }
    const menu = electron_1.Menu.buildFromTemplate(template);
    //@ts-expect-error
    menu.popup(electron_1.BrowserWindow.fromWebContents(event.sender));
}
exports.loadContextMenu = loadContextMenu;
function getAlbumContextMenuTemplate(albumId) {
    let album = storage_service_1.getStorageMap().get(albumId);
    let template = [];
    template.push({
        label: `Show ${(album === null || album === void 0 ? void 0 : album.Name) || ''} Folder`,
        click: () => {
            electron_1.shell.openPath((album === null || album === void 0 ? void 0 : album.RootDir) || '');
        }
    });
    template.push({
        label: `Reload Album Data`,
        click: () => {
            songSync_service_1.reloadAlbumData(albumId);
        }
    });
    template.push({
        label: `Reload Album Cover`,
        click: (menuItem, browserWindow, event) => {
            if (album) {
                albumArt_service_1.getAlbumCover(album.RootDir, false, true).then((result) => {
                    browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.webContents.send('new-cover', {
                        success: result !== undefined,
                        id: album === null || album === void 0 ? void 0 : album.ID,
                        filePath: result === null || result === void 0 ? void 0 : result.filePath,
                        fileType: result === null || result === void 0 ? void 0 : result.fileType
                    });
                });
            }
        }
    });
    return template;
}
