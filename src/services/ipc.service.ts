import { ipcMain } from 'electron'
import { getConfig, saveConfig } from './config.service'
import { getCollection, getCollectionMap, getNewPromiseDbVersion } from './loki.service'
import { orderSongs } from './songFilter.service'
// import { nanoid } from 'nanoid'
import { getAlbumArray, getNewPromiseAlbumArray } from './albumFiltering.service'
import { getAlbumCover } from './albumArt.service'
import { getAlbumColors } from './getAlbumColors.fn'

import { customAlphabet } from 'nanoid'
import { getWaveform } from '../functions/getWaveform.fn'
// import { getTotalChangesToProcess, getTotalProcessedChanged } from './folderWatcher.service'
import { hash } from '../functions/hashString.fn'
import { groupSongs } from '../functions/groupSong.fn'
import { getMaxTaskQueueLength, getTaskQueueLength } from './folderWatcher.service'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 20)

export function loadIPC() {
	ipcMain.handle('get-order', async (evt, arg) => {
		let config = getConfig()
		let grouping = config['order']['grouping'] || []
		let filtering = config['order']['filtering'] || []
		let result: any[] = orderSongs(arg, grouping, filtering)

		result = result.map((value) => ({
			id: nanoid(),
			value
		}))

		return result
	})

	ipcMain.handle('get-config', async (evt, arg) => {
		let config = getConfig()
		return config
	})

	ipcMain.handle('get-grouping', async (evt, valueToGroupBy) => {
		return groupSongs(valueToGroupBy)
	})

	ipcMain.handle('save-config', (evt, newConfig) => {
		return saveConfig(newConfig)
	})

	ipcMain.handle('open-config', () => {
		console.log('Open Config File')
		// shell.showItemInFolder(configFilePath)
		return
	})

	ipcMain.handle('get-albums', async (evt, groupBy, groupByValue) => {
		let docs = getCollectionMap()
		let groupedSongs: any[] = []

		docs.forEach((doc) => {
			doc.Songs.forEach((song) => {
				if (song[groupBy] === groupByValue) {
					let rootDir = song.SourceFile.split('/').slice(0, -1).join('/')

					let foundAlbum = groupedSongs.find((i) => i['RootDir'] === rootDir)

					if (!foundAlbum) {
						groupedSongs.push({
							ID: hash(rootDir),
							RootDir: rootDir,
							AlbumArtist: song.AlbumArtist,
							Name: song.Album
						})
					}
				}
			})
		})

		return groupedSongs
	})

	ipcMain.handle('get-album', (evt, albumID) => {
		return getCollectionMap().get(albumID)
	})

	ipcMain.handle('get-cover', async (evt, rootDir) => {
		return await getAlbumCover(rootDir)
	})

	ipcMain.handle('get-album-colors', async (evt, imageId) => {
		return await getAlbumColors(imageId)
	})

	ipcMain.handle('sync-db-version', async (evt, value) => {
		return await getNewPromiseDbVersion(value)
	})

	ipcMain.handle('get-waveform', async (evt, path) => {
		return await getWaveform(path)
	})

	ipcMain.handle('get-changes-progress', async (evt) => {
		return {
			total: getMaxTaskQueueLength(),
			current: getTaskQueueLength()
		}
	})
}
