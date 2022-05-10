"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextMenu = void 0;
const electron_1 = require("electron");
const sendWebContents_service_1 = require("./sendWebContents.service");
const songSync_service_1 = require("./songSync.service");
function loadContextMenu(event, menuToOpen, data) {
    console.log(event, menuToOpen, data);
    let template = [];
    if (menuToOpen === 'AlbumContextMenu') {
        template = getAlbumContextMenuTemplate(data);
    }
    else if (menuToOpen === 'SongListContextMenu') {
        template = getSongListContextMenuTemplate(data);
    }
    else if (menuToOpen === 'GroupNameContextMenu') {
        template = getGroupNameContextMenuTemplate(data);
    }
    const menu = electron_1.Menu.buildFromTemplate(template);
    //@ts-expect-error
    menu.popup(electron_1.BrowserWindow.fromWebContents(event.sender));
}
exports.loadContextMenu = loadContextMenu;
function getGroupNameContextMenuTemplate(data) {
    let groupName = data.groupName;
    let index = data.index;
    let template = [];
    let tags = ['Album', 'Artist', 'Track', 'Title', 'Genre', 'Composer', 'Year', 'Disc #', 'Extension'];
    // Removes the current tag from the list.
    tags.splice(tags.indexOf(groupName), 1);
    // Then adds the current tag to the begining of  the list.
    tags.unshift(groupName);
    tags.forEach(tag => {
        template.push({
            label: `${groupName === tag ? '•' : ''} ${tag}`,
            click: () => {
                (0, sendWebContents_service_1.sendWebContents)('new-group', {
                    index,
                    groupName: tag
                });
            }
        });
    });
    return template;
}
function getSongListContextMenuTemplate(data) {
    let template = [];
    if (data.songs.length === 1) {
        // let album = getStorageMap().get(data.albumId)
        // let song = album?.Songs.find(x => x.ID === data.songs[0])
        template.push({
            label: `Show File`,
            click: () => {
                var _a;
                electron_1.shell.showItemInFolder(((_a = data.songs) === null || _a === void 0 ? void 0 : _a.SourceFile) || '');
            }
        });
    }
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
                (0, sendWebContents_service_1.sendWebContents)('show-song-amount', value);
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
                        (0, sendWebContents_service_1.sendWebContents)('sort-songs', {
                            tag: option,
                            order: 1
                        });
                    }
                },
                {
                    label: 'Desc (Z->A)',
                    click: () => {
                        (0, sendWebContents_service_1.sendWebContents)('sort-songs', {
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
            (0, songSync_service_1.reloadAlbumData)(data.albumId);
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
