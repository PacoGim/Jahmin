import { Menu, BrowserWindow } from 'electron'
import getAlbumContextMenuTemplateFn from './getAlbumContextMenuTemplate.fn'
import getGroupNameContextMenuTemplateFn from './getGroupNameContextMenuTemplate.fn'
import getSongListContextMenuTemplateFn from './getSongListContextMenuTemplate.fn'


export function loadContextMenu(event: any, menuToOpen: string, data: any) {
	let template: any = []

	if (menuToOpen === 'AlbumContextMenu') {
		template = getAlbumContextMenuTemplateFn(data)
	} else if (menuToOpen === 'SongListContextMenu') {
		template = getSongListContextMenuTemplateFn(data)
	} else if (menuToOpen === 'GroupNameContextMenu') {
		template = getGroupNameContextMenuTemplateFn(data)
	}

	const menu = Menu.buildFromTemplate(template)
	//@ts-expect-error
	menu.popup(BrowserWindow.fromWebContents(event.sender))
}

