"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextMenu = void 0;
const electron_1 = require("electron");
const albumArt_service_1 = require("./albumArt.service");
const sendWebContents_service_1 = require("./sendWebContents.service");
const songSync_service_1 = require("./songSync.service");
const storage_service_1 = require("./storage.service");
function loadContextMenu(event, menuToOpen, data) {
    let template = [];
    if (menuToOpen === 'AlbumContextMenu') {
        template = getAlbumContextMenuTemplate(data);
    }
    else if (menuToOpen === 'SongListContextMenu') {
        template = getSongListContextMenuTemplate(data);
    }
    const menu = electron_1.Menu.buildFromTemplate(template);
    //@ts-expect-error
    menu.popup(electron_1.BrowserWindow.fromWebContents(event.sender));
}
exports.loadContextMenu = loadContextMenu;
function getSongListContextMenuTemplate(data) {
    let template = [];
    template.push({
        label: `Disable Song${data.songs.length > 1 ? 's' : ''}`,
        click: () => {
            //TODO Disable songs
        }
    });
    template.push({
        label: 'Songs to Show',
        type: 'submenu',
        submenu: getSongAmountMenu()
    });
    template.push({
        type: 'separator'
    });
    template.push({
        label: 'Sort by',
        type: 'submenu',
        submenu: getSortMenu()
    });
    return template;
}
function getSongAmountMenu() {
    let submenu = [];
    Array.from({ length: 9 }, (x, i) => i + 4).forEach(value => {
        submenu.push({
            label: value.toString(),
            click: () => {
                sendWebContents_service_1.sendWebContents('show-song-amount', value);
            }
        });
    });
    return submenu;
}
function getSortMenu() {
    let submenu = [];
    submenu.push({
        label: 'Add Sorting',
        click: () => {
            //TODO Add sorting option
        }
    });
    let options = [
        'Track',
        'Rating',
        'Title',
        'Artist',
        'Composer',
        'Date',
        'Duration',
        'Extension',
        'Genre',
        'Sample Rate',
        'Size',
        'BitRate',
        'Comment',
        'Disc #'
    ];
    options.forEach(option => {
        submenu.push({
            label: option,
            type: 'submenu',
            submenu: [
                {
                    label: 'Asc (A->Z)',
                    click: () => {
                        sendWebContents_service_1.sendWebContents('sort-songs', {
                            tag: option,
                            order: 1
                        });
                    }
                },
                {
                    label: 'Desc (Z->A)',
                    click: () => {
                        sendWebContents_service_1.sendWebContents('sort-songs', {
                            tag: option,
                            order: -1
                        });
                    }
                }
            ]
        });
    });
    return submenu;
}
function getAlbumContextMenuTemplate(data) {
    let album = storage_service_1.getStorageMap().get(data.albumId);
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
            songSync_service_1.reloadAlbumData(data.albumId);
        }
    });
    template.push({
        label: `Reload Album Cover`,
        click: () => {
            if (album) {
                albumArt_service_1.getAlbumCover(album.RootDir, false, true).then(result => {
                    sendWebContents_service_1.sendWebContents('new-cover', {
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
