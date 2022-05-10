"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const config_service_1 = require("../services/config.service");
const sendWebContents_service_1 = require("../services/sendWebContents.service");
function default_1(data) {
    let template = [];
    let { selectedSongsData, clickedSongData, albumRootDir } = data;
    let isClickedSongInSelectedSongs = selectedSongsData.find(song => song.ID === (clickedSongData === null || clickedSongData === void 0 ? void 0 : clickedSongData.ID));
    /*
    1. No songs selected && No song cliked on
    2. No songs selected && Song clicked on
    3. Songs selected && No song cliked on
    4. Songs selected && Song clicked on
  */
    /*if (selectedSongsData.length === 0 && clickedSongData === undefined) {
        console.log('1. No songs selected && No song cliked on')
    } else */ if (selectedSongsData.length === 0 && clickedSongData !== undefined) {
        template.push({
            label: `Selected Song`,
            type: 'submenu',
            submenu: [
                {
                    label: 'Show File'
                },
                {
                    label: 'Disable'
                }
            ]
        });
    }
    else if (selectedSongsData.length > 0 && clickedSongData === undefined) {
        console.log('3. Songs selected && No song cliked on');
    }
    else if (selectedSongsData.length > 0 && clickedSongData !== undefined && isClickedSongInSelectedSongs === undefined) {
        console.log('4. Songs selected && Song clicked on but not in selected songs');
    }
    else if (selectedSongsData.length > 0 && clickedSongData !== undefined && isClickedSongInSelectedSongs !== undefined) {
        // console.log('5. Songs selected && Song clicked on and in selected songs')
        template.push({
            label: `${cutString(clickedSongData.Title || '', 20)}`
        });
        template.push({
            label: `Show File`,
            click: () => {
                electron_1.shell.showItemInFolder((clickedSongData === null || clickedSongData === void 0 ? void 0 : clickedSongData.SourceFile) || '');
            }
        });
        template.push({
            label: `Disable Song`,
            click: () => disableSongs([clickedSongData])
        });
        template.push({
            type: 'separator'
        });
    }
    /*
    if (selectedSongsData.length === 1 && isClickedSongInSelectedSongs) {
    }

    if (clickedSongData !== undefined) {
        template.push({
            label: `Show File: ${cutString(clickedSongData.Title || '', 20)}`,
            click: () => {
                shell.showItemInFolder(clickedSongData?.SourceFile || '')
            }
        })
    }

    // If the clicked song is present inside the selected songs.
    if (clickedSongData !== undefined && !isClickedSongInSelectedSongs) {
        template.push({
            label: `Disable: ${cutString(clickedSongData.Title || '', 26)}`,
            click: () => disableSongs([clickedSongData!])
        })
    } else if (selectedSongsData.length > 0) {
        template.push({
            label: `Disable ${selectedSongsData.length} Song${selectedSongsData.length > 1 ? 's' : ''}`,
            click: () => disableSongs(selectedSongsData)
        })
    }

  */
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
exports.default = default_1;
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
