"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendWebContents_service_1 = require("../services/sendWebContents.service");
function default_1(data) {
    let template = [];
    console.log(data);
    /*
      if (data.songs.length === 1) {
    
        template.push({
          label: `Show File`,
          click: () => {
            shell.showItemInFolder(data.songs?.SourceFile || '')
          }
        })
      } */
    /*   template.push({
        label: `Disable Song${data.songs.length > 1 ? 's' : ''}`,
        click: () => {
          //TODO Disable songs
        }
      }) */
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
