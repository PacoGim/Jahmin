"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextMenu = void 0;
const electron_1 = require("electron");
const albumArt_service_1 = require("./albumArt.service");
const songSync_service_1 = require("./songSync.service");
const storage_service_1 = require("./storage.service");
function loadContextMenu(event, menuToOpen, data) {
    let template = [];
    if (menuToOpen === 'AlbumContextMenu') {
        template = getAlbumContextMenuTemplate(data);
    }
    else if (menuToOpen === 'SongContextMenu') {
        template = getSongContextMenuTemplate(data);
    }
    const menu = electron_1.Menu.buildFromTemplate(template);
    //@ts-expect-error
    menu.popup(electron_1.BrowserWindow.fromWebContents(event.sender));
}
exports.loadContextMenu = loadContextMenu;
function getSongContextMenuTemplate(data) {
    let template = [];
    template.push({
        label: `Disable Song${data.songs.length > 1 ? 's' : ''}`,
        click: () => {
            console.log('Cool');
        }
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
function getSortMenu() {
    let submenu = [];
    submenu.push({
        label: 'Add Sorting',
        click: () => {
            //TODO Add sorting option
            console.log('Add Sorting');
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
    options.forEach((option) => {
        submenu.push({
            label: option,
            type: 'submenu',
            submenu: [
                {
                    label: 'Asc (A->Z)',
                    click: (menuItem, browserWindow, event) => {
                        sendSortingToRenderer(browserWindow, option, 1);
                    }
                },
                {
                    label: 'Desc (Z->A)',
                    click: (menuItem, browserWindow, event) => {
                        sendSortingToRenderer(browserWindow, option, -1);
                    }
                }
            ]
        });
    });
    return submenu;
}
function sendSortingToRenderer(browserWindow, tag, order) {
    browserWindow === null || browserWindow === void 0 ? void 0 : browserWindow.webContents.send('sort-songs', {
        tag,
        order
    });
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
