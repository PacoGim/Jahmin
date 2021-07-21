"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextMenu = void 0;
const electron_1 = require("electron");
const main_1 = require("electron/main");
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
            electron_1.shell.showItemInFolder((album === null || album === void 0 ? void 0 : album.RootDir) || '');
        }
    });
    template.push({
        label: `Reload Album Data`,
        click: () => {
            songSync_service_1.reloadAlbumData(albumId);
        }
    });
    template.push({
        label: `Add Album Cover`,
        click: () => {
            main_1.dialog.showOpenDialog({ properties: ['openFile'] }).then((result) => {
                console.log(result);
            });
        }
    });
    return template;
}
