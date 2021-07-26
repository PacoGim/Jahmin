"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextMenu = void 0;
const electron_1 = require("electron");
const albumArt_service_1 = require("./albumArt.service");
const songSync_service_1 = require("./songSync.service");
const storage_service_1 = require("./storage.service");
const systemSync_service_1 = require("./systemSync.service");
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
        label: `Reload Album Cover`,
        click: () => {
            if (album) {
                albumArt_service_1.getAlbumCover(album.RootDir).then((result) => {
                    systemSync_service_1.addTaskToSync({
                        type: 'newCoverArt',
                        data: {
                            id: album === null || album === void 0 ? void 0 : album.ID,
                            filePath: result.filePath,
                            fileType: result.fileType
                        }
                    });
                });
            }
        }
    });
    return template;
}
