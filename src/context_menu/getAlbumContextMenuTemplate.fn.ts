import { MenuItemConstructorOptions, shell } from "electron"
import { sendWebContents } from "../services/sendWebContents.service"

export default function (data: any) {
  let template: MenuItemConstructorOptions[] = []

  template.push({
    label: `Show Folder`,
    click: () => {
      shell.openPath(data.albumRootDir || '')
    }
  })

  template.push({
    label: `Reload Album Data`,
    click: () => {
      // reloadAlbumData(data.albumId)
    }
  })

  template.push({
    label: `Reload Album Art`,
    click: () => {
      if (data.albumId) {
        sendWebContents('get-art-sizes', {
          albumId: data.albumId
        })
      }
    }
  })

  return template
}