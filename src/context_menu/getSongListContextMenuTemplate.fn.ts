import { MenuItemConstructorOptions, shell } from "electron"
import { sendWebContents } from "../services/sendWebContents.service"

export default function (data: any) {
  let template: MenuItemConstructorOptions[] = []

  console.log(data)
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
  })

  template.push({
    type: 'separator'
  })

  template.push({
    label: 'Sort by',
    type: 'submenu',
    submenu: getSortMenu()
  })

  return template
}



function getSongAmountMenu() {
  let submenu: MenuItemConstructorOptions[] = []

  Array.from({ length: 9 }, (x, i) => i + 4).forEach(value => {
    submenu.push({
      label: value.toString(),
      click: () => {
        sendWebContents('show-song-amount', value)
      }
    })
  })

  return submenu
}

function getSortMenu() {
  let submenu: MenuItemConstructorOptions[] = []
  submenu.push({
    label: 'Add Sorting',
    click: () => {
      //TODO Add sorting option
    }
  })

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
  ]

  options.forEach(option => {
    submenu.push({
      label: option,
      type: 'submenu',
      submenu: [
        {
          label: 'Asc (A->Z)',
          click: () => {
            sendWebContents('sort-songs', {
              tag: option,
              order: 1
            })
          }
        },
        {
          label: 'Desc (Z->A)',
          click: () => {
            sendWebContents('sort-songs', {
              tag: option,
              order: -1
            })
          }
        }
      ]
    })
  })

  return submenu
}

