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
		label: data.keyModifier === 'altKey' ? 'Add to Playback (Force add)' : 'Add to Playback',
		click: () => {
			sendWebContentsFn('album-add-to-playback', {
				songList: data.songList,
				clickedAlbum: data.albumRootDir,
				selectedAlbumsDir: data.selectedAlbumsDir,
				keyModifier: data.keyModifier
			})
		}
	})

	template.push({
		label: data.keyModifier === 'altKey' ? 'Play After (Force add)' : 'Play After',
		click: () => {
			sendWebContentsFn('album-play-after', {
				songList: data.songList,
				clickedAlbum: data.albumRootDir,
				selectedAlbumsDir: data.selectedAlbumsDir,
				keyModifier: data.keyModifier
			})
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
