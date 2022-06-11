"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const config_service_1 = require("../services/config.service");
const sendWebContents_service_1 = require("../services/sendWebContents.service");
function default_1(data) {
    let template = [];
    let { selectedSongsData, clickedSongData } = data;
    if (selectedSongsData.length !== 0 || clickedSongData !== undefined) {
        template.push({
            label: 'Enable',
            click: () => {
                handleEnableDisableSongs({ enable: true }, selectedSongsData, clickedSongData);
            }
        });
        template.push({
            label: 'Disable',
            click: () => {
                handleEnableDisableSongs({ enable: false }, selectedSongsData, clickedSongData);
            }
        });
        addSeparator(template);
    }
    template.push({
        label: 'Reveal in Folder',
        enabled: clickedSongData !== undefined,
        click: () => {
            if (clickedSongData !== undefined) {
                electron_1.shell.showItemInFolder(clickedSongData.SourceFile);
            }
        }
    });
    template.push({
        label: 'Songs to Show',
        type: 'submenu',
        submenu: getSongAmountMenu()
    });
    addSeparator(template);
    template.push({
        label: 'Sort by',
        type: 'submenu',
        submenu: getSortMenu()
    });
    return template;
}
exports.default = default_1;
function handleEnableDisableSongs({ enable }, selectedSongs, clickedSong) {
    let isClickedSongInSelectedSongs = selectedSongs.find(song => song.ID === (clickedSong === null || clickedSong === void 0 ? void 0 : clickedSong.ID)) ? true : false;
    if (isClickedSongInSelectedSongs === false && clickedSong !== undefined) {
        clickedSong.isEnabled = enable;
        selectedSongs.push(clickedSong);
    }
    else if (selectedSongs.length !== 0) {
        selectedSongs.forEach(song => {
            song.isEnabled = enable;
        });
    }
    selectedSongs
        .filter(song => song.hasOwnProperty('isEnabled'))
        .forEach(song => {
        (0, sendWebContents_service_1.sendWebContents)('web-storage', {
            type: 'update',
            data: {
                id: song.ID,
                newTags: {
                    isEnabled: song.isEnabled
                }
            }
        });
    });
}
function getSongAmountMenu() {
    let submenu = [];
    let songAmountConfig = (0, config_service_1.getConfig)().userOptions.songAmount;
    // From 4 to 12 as song amount.
    for (let i = 4; i <= 12; i++) {
        submenu.push({
            type: 'radio',
            label: String(i),
            click: () => {
                (0, sendWebContents_service_1.sendWebContents)('show-song-amount', i);
            },
            checked: i === songAmountConfig,
            enabled: i !== songAmountConfig
        });
    }
    return submenu;
}
function getSortMenu() {
    var _a;
    let submenu = [];
    let options = (_a = (0, config_service_1.getConfig)().songListTags) === null || _a === void 0 ? void 0 : _a.map(tag => tag.value);
    options === null || options === void 0 ? void 0 : options.splice(options.indexOf('DynamicArtists'), 1);
    options === null || options === void 0 ? void 0 : options.splice(options.indexOf('PlayCount'), 1, 'Play Count');
    options === null || options === void 0 ? void 0 : options.splice(options.indexOf('SampleRate'), 1, 'Sample Rate');
    let sortByConfig = (0, config_service_1.getConfig)().userOptions.sortBy;
    let sortOrderConfig = (0, config_service_1.getConfig)().userOptions.sortOrder;
    if (options === undefined) {
        options = [
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
    }
    options.forEach(option => {
        submenu.push({
            label: option,
            type: 'submenu',
            submenu: [
                {
                    label: 'Asc (A->Z)',
                    type: 'radio',
                    checked: sortByConfig === option && sortOrderConfig === 'asc',
                    enabled: sortByConfig !== option || sortOrderConfig !== 'asc',
                    click: () => {
                        (0, sendWebContents_service_1.sendWebContents)('sort-songs', {
                            tag: option,
                            order: 'asc'
                        });
                    }
                },
                {
                    label: 'Desc (Z->A)',
                    type: 'radio',
                    checked: sortByConfig === option && sortOrderConfig === 'desc',
                    enabled: sortByConfig !== option || sortOrderConfig !== 'desc',
                    click: () => {
                        (0, sendWebContents_service_1.sendWebContents)('sort-songs', {
                            tag: option,
                            order: 'desc'
                        });
                    }
                }
            ]
        });
    });
    return submenu;
}
function disableSongs(songs) {
    console.log(songs);
}
function cutString(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    else {
        return str;
    }
}
function addSeparator(template) {
    template.push({
        type: 'separator'
    });
}
