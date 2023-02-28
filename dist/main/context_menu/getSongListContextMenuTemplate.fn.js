"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sendWebContents_fn_1 = __importDefault(require("../functions/sendWebContents.fn"));
const config_service_1 = require("../services/config.service");
const lyrics_service_1 = require("../services/lyrics.service");
const addSeparator_fn_1 = __importDefault(require("./functions/addSeparator.fn"));
function default_1(data) {
    let template = [];
    let { selectedSongsData, clickedSongData } = data;
    // If songs selected or a song has been clicked.
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
        (0, addSeparator_fn_1.default)(template);
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
    (0, addSeparator_fn_1.default)(template);
    template.push({
        label: 'Sort by',
        type: 'submenu',
        submenu: getSortMenu()
    });
    if (clickedSongData !== undefined) {
        (0, addSeparator_fn_1.default)(template);
        template.push({
            label: 'Edit Lyrics',
            click: () => editLyrics(clickedSongData)
        });
    }
    template.push({
        label: 'Add to playback',
        click: () => {
            (0, sendWebContents_fn_1.default)('song-add-to-playback', { clickedSong: data.clickedSongData, selectedSongs: data.selectedSongsData });
        }
    });
    template.push({
        label: 'Play after',
        click: () => {
            (0, sendWebContents_fn_1.default)('song-play-after', { clickedSong: data.clickedSongData, selectedSongs: data.selectedSongsData });
        }
    });
    return template;
}
exports.default = default_1;
function editLyrics(song) {
    (0, lyrics_service_1.saveLyrics)(null, song.Title, song.Artist).then(() => {
        (0, sendWebContents_fn_1.default)('show-lyrics', { title: song.Title, artist: song.Artist });
    });
}
function handleEnableDisableSongs({ enable }, selectedSongs, clickedSong) {
    let isClickedSongInSelectedSongs = selectedSongs.find(song => song.ID === clickedSong?.ID) ? true : false;
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
        (0, sendWebContents_fn_1.default)('web-storage', {
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
                (0, sendWebContents_fn_1.default)('show-song-amount', i);
            },
            checked: i === songAmountConfig,
            enabled: i !== songAmountConfig
        });
    }
    return submenu;
}
function getSortMenu() {
    let submenu = [];
    let options = (0, config_service_1.getConfig)().songListTags?.map(tag => tag.value);
    options?.splice(options.indexOf('DynamicArtists'), 1);
    options?.splice(options.indexOf('PlayCount'), 1, 'Play Count');
    options?.splice(options.indexOf('SampleRate'), 1, 'Sample Rate');
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
                        (0, sendWebContents_fn_1.default)('sort-songs', {
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
                        (0, sendWebContents_fn_1.default)('sort-songs', {
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
    // console.log(songs)
}
function cutString(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    else {
        return str;
    }
}
