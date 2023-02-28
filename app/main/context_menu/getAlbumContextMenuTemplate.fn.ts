import { MenuItemConstructorOptions, shell } from 'electron'
import sendWebContentsFn from '../functions/sendWebContents.fn'

import verifyFolderTegrityFn from '../functions/verifyFolderTegrity.fn'
import addSeparatorFn from './functions/addSeparator.fn'

export default function (data: any) {
	let template: MenuItemConstructorOptions[] = []

	template.push({
		label: `Show Folder`,
		click: () => {
			shell.openPath(data.albumRootDir || '')
		}
	})

	addSeparatorFn(template)

	template.push({
		label: 'Play Now',
		click: () => {
			sendWebContentsFn('album-play-now', {
				songList: data.songList,
				clickedAlbum: data.albumRootDir,
				selectedAlbumsDir: data.selectedAlbumsDir
			})
		}
	})

	template.push({
		label: 'Add to Playback',
		click: () => {
			sendWebContentsFn('album-add-to-playback', data.songList)
		}
	})

	template.push({
		label: 'Play After',
		click: () => {
			sendWebContentsFn('album-play-after', data.songList)
		}
	})

	addSeparatorFn(template)

	template.push({
		label: `Reload Album Data`,
		click: () => {
			if (data.albumRootDir) verifyFolderTegrityFn(data.albumRootDir)
		}
	})

	template.push({
		label: `Reload Album Art`,
		click: () => {
			if (data.albumId) {
				sendWebContentsFn('get-art-sizes', {
					albumId: data.albumId
				})
			}
		}
	})

	return template
}
