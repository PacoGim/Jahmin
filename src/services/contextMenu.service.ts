import { shell, Menu, BrowserWindow } from 'electron'
import { dialog, MenuItemConstructorOptions } from 'electron/main'
import { getAlbumCover } from './albumArt.service'
import { reloadAlbumData } from './songSync.service'
import { getStorageMap } from './storage.service'
import { addTaskToSync } from './systemSync.service'

export function loadContextMenu(event: any, menuToOpen: string, parameters: any) {
	let template: any = []

	parameters = JSON.parse(parameters)

	if (menuToOpen === 'AlbumContextMenu') {
		template = getAlbumContextMenuTemplate(parameters.albumId)
	}

	const menu = Menu.buildFromTemplate(template)
	//@ts-expect-error
	menu.popup(BrowserWindow.fromWebContents(event.sender))
}

function getAlbumContextMenuTemplate(albumId: string) {
	let album = getStorageMap().get(albumId)
	let template: MenuItemConstructorOptions[] = []

	template.push({
		label: `Show ${album?.Name || ''} Folder`,
		click: () => {
			shell.openPath(album?.RootDir || '')
		}
	})

	template.push({
		label: `Reload Album Data`,
		click: () => {
			reloadAlbumData(albumId)
		}
	})

	template.push({
		label: `Reload Album Cover`,
		click: (menuItem, browserWindow, event) => {
			if (album) {
				getAlbumCover(album.RootDir, false, true).then((result) => {
					browserWindow?.webContents.send('new-cover', {
						success: result !== undefined,
						id: album?.ID,
						filePath: result?.filePath,
						fileType: result?.fileType
					})
				})
			}
		}
	})

	return template
}
