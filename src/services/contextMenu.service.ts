import { shell, Menu, BrowserWindow } from 'electron'
import { MenuItemConstructorOptions } from 'electron/main'
import { hash } from '../functions/hashString.fn'
import { getAlbumArt } from './albumArt.service'
import { getConfig } from './config.service'
import { sendWebContents } from './sendWebContents.service'
import { reloadAlbumData } from './songSync.service'
import { getStorageMap } from './storage.service'

export function loadContextMenu(event: any, menuToOpen: string, data: any) {
	let template: any = []

	if (menuToOpen === 'AlbumContextMenu') {
		template = getAlbumContextMenuTemplate(data)
	} else if (menuToOpen === 'SongListContextMenu') {
		template = getSongListContextMenuTemplate(data)
	} else if (menuToOpen === 'GroupNameContextMenu') {
		template = getGroupNameContextMenuTemplate(data)
	}

	const menu = Menu.buildFromTemplate(template)
	//@ts-expect-error
	menu.popup(BrowserWindow.fromWebContents(event.sender))
}

function getGroupNameContextMenuTemplate(data: any) {
	let groupName = data.groupName
	let index = data.index
	let template: MenuItemConstructorOptions[] = []

	let tags = ['Album', 'Artist', 'Track', 'Title', 'Genre', 'Composer', 'Year', 'Disc #', 'Extension']

	// Removes the current tag from the list.
	tags.splice(tags.indexOf(groupName), 1)

	// Then adds the current tag to the begining of  the list.
	tags.unshift(groupName)

	tags.forEach(tag => {
		template.push({
			label: `${groupName === tag ? '•' : ''} ${tag}`,
			click: () => {
				sendWebContents('new-group', {
					index,
					groupName: tag
				})
			}
		})
	})

	return template
}

function getSongListContextMenuTemplate(data: any) {
	let template: MenuItemConstructorOptions[] = []

	if (data.songs.length === 1) {
		let album = getStorageMap().get(data.albumId)
		let song = album?.Songs.find(x => x.ID === data.songs[0])

		template.push({
			label: `Show File`,
			click: () => {
				shell.showItemInFolder(song?.SourceFile || '')
			}
		})
	}

	template.push({
		label: `Disable Song${data.songs.length > 1 ? 's' : ''}`,
		click: () => {
			//TODO Disable songs
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

function getAlbumContextMenuTemplate(data: any) {
	let album = getStorageMap().get(data.albumId)
	let template: MenuItemConstructorOptions[] = []

	template.push({
		label: `Show Folder`,
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
		label: `Reload Album Art`,
		click: () => {
			if (album) {
				let albumId = hash(album.RootDir, 'text') as string

				getAlbumArt(albumId, getConfig().userOptions.artSize || 192, null, false, true)

				/* 		getAlbumArt(album.RootDir, null,null, false, true).then(result => {
					sendWebContents('new-art', {
						success: result !== undefined,
						id: album?.ID,
						filePath: result?.filePath,
						fileType: result?.fileType
					})
				}) */
			}
		}
	})

	return template
}
