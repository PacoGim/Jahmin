import { Menu, BrowserWindow } from 'electron'

import getAlbumContextMenuTemplateFn from './getAlbumContextMenuTemplate.fn'
import getGroupNameContextMenuTemplateFn from './getGroupNameContextMenuTemplate.fn'
import getSongListContextMenuTemplateFn from './getSongListContextMenuTemplate.fn'
import getLyricsContainerCtxMenuTemplateFn from './getLyricsContainerCtxMenuTemplate.fn'

export async function loadContextMenu(event: any, menuToOpen: string, data: any) {
	let template: any = []

	if (menuToOpen === 'AlbumContextMenu') {
		template = getAlbumContextMenuTemplateFn(data)
	} else if (menuToOpen === 'SongListContextMenu') {
		template = await getSongListContextMenuTemplateFn(data)
	} else if (menuToOpen === 'GroupNameContextMenu') {
		template = getGroupNameContextMenuTemplateFn()
	} else if (menuToOpen === 'LyricsContainerContextMenu') {
		template = getLyricsContainerCtxMenuTemplateFn(data)
	}

	const menu = Menu.buildFromTemplate(template)
	//@ts-expect-error
	menu.popup(BrowserWindow.fromWebContents(event.sender))
}
