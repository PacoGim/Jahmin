import { shell, Menu, BrowserWindow } from 'electron'
import { reloadAlbumData } from './songSync.service'
import { getStorageMap } from './storage.service'

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
	let template = []

	template.push({
		label: `Show ${album?.Name || ''} Folder`,
		click: () => {
			shell.showItemInFolder(album?.RootDir || '')
		}
	})

	template.push({
		label: `Reload Album Data`,
		click: () => {
			reloadAlbumData(albumId)
		}
	})

	return template
}