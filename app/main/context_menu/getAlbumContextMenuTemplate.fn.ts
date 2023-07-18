import { MenuItemConstructorOptions, shell } from 'electron'
import sendWebContentsFn from '../functions/sendWebContents.fn'

import verifyFolderTegrityFn from '../functions/verifyFolderTegrity.fn'
import addSeparatorFn from './functions/addSeparator.fn'
import { getWorker, useWorker } from '../services/workers.service'
import { Worker } from 'worker_threads'
import { getConfig } from '../services/config.service'
import { DatabaseResponseType } from '../../types/databaseWorkerMessage.type'

let worker: Worker

getWorker('database').then(w => (worker = w))

export default function (data: any) {
	let template: MenuItemConstructorOptions[] = []

	let config = getConfig()

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
		label: data.keyModifier === 'altKey' ? 'Play After Current Song (Force add)' : 'Play After Current Song',
		click: async () => {
			let bulkReadResponse: DatabaseResponseType = await useWorker(
				{
					type: 'read',
					data: {
						queryData: {
							select: ['*'],
							andWhere: [
								{
									Directory: data.albumRootDir
								}
							],
							order: [`${config.userOptions.sortBy} ${config.userOptions.sortOrder}`]
						}
					}
				},
				worker
			)

			let songs = bulkReadResponse.results.data

			sendWebContentsFn('album-play-after', {
				songs,
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
