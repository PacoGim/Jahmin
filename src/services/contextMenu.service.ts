import { shell, Menu, BrowserWindow } from 'electron'
import { MenuItemConstructorOptions } from 'electron/main'
import { getAlbumCover } from './albumArt.service'
import { reloadAlbumData } from './songSync.service'
import { getStorageMap } from './storage.service'

export function loadContextMenu(event: any, menuToOpen: string, data: any) {
	let template: any = []

	if (menuToOpen === 'AlbumContextMenu') {
		template = getAlbumContextMenuTemplate(data)
	} else if (menuToOpen === 'SongListContextMenu') {
		template = getSongListContextMenuTemplate(data)
	}

	const menu = Menu.buildFromTemplate(template)
	//@ts-expect-error
	menu.popup(BrowserWindow.fromWebContents(event.sender))
}

function getSongListContextMenuTemplate(data: any) {
	let template: MenuItemConstructorOptions[] = []

	template.push({
		label: `Disable Song${data.songs.length > 1 ? 's' : ''}`,
		click: () => {
			console.log('Cool')
		}
	})

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
			click: (menuItem, browserWindow, event) => {
				sendSongAmoutToShowToRenderer(browserWindow, value)
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
			console.log('Add Sorting')
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
					click: (menuItem, browserWindow, event) => {
						sendSortingToRenderer(browserWindow, option, 1)
					}
				},
				{
					label: 'Desc (Z->A)',
					click: (menuItem, browserWindow, event) => {
						sendSortingToRenderer(browserWindow, option, -1)
					}
				}
			]
		})
	})

	return submenu
}

function sendSongAmoutToShowToRenderer(browserWindow: BrowserWindow | undefined, songAmount: number) {
	browserWindow?.webContents.send('show-song-amount', songAmount)
}
function sendSortingToRenderer(browserWindow: BrowserWindow | undefined, tag: string, order: number) {
	browserWindow?.webContents.send('sort-songs', {
		tag,
		order
	})
}

function getAlbumContextMenuTemplate(data: any) {
	let album = getStorageMap().get(data.albumId)
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
			reloadAlbumData(data.albumId)
		}
	})

	template.push({
		label: `Reload Album Cover`,
		click: (menuItem, browserWindow, event) => {
			if (album) {
				getAlbumCover(album.RootDir, false, true).then(result => {
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
