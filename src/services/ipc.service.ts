import { ipcMain } from 'electron'
import { getConfig, saveConfig } from './config.service'
// import { getCollectionMap, getNewPromiseDbVersion } from './loki.service.bak'
import { orderSongs } from './songFilter.service'
import { getAlbumCover } from './albumArt.service'
import { getAlbumColors } from './getAlbumColors.fn'
import { customAlphabet } from 'nanoid'
// import { getTotalChangesToProcess, getTotalProcessedChanged } from './folderWatcher.service'
import { hash } from '../functions/hashString.fn'
import { groupSongs } from '../functions/groupSong.fn'
import { getMaxTaskQueueLength, getTaskQueueLength } from './songSync.service'
import { getPeaks, savePeaks } from './peaks'
import { getTagEditProgress, tagEdit } from './tagEdit.service'
// import { getTagEditProgress } from '../functions/getTagEditProgress.fn'
import { getFuzzyList, getNewPromiseDbVersion, getStorageMap, getStorageMapToArray } from './storage.service'
import { loadContextMenu } from './contextMenu.service'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 20)

import Fuse from 'fuse.js'

export function loadIPC() {
	ipcMain.on('show-context-menu', (event, menuToOpen, parameters) => loadContextMenu(event, menuToOpen, parameters))

	ipcMain.handle('stream-audio', async (evt, path) => {
		// console.log(path)
		// return fs.createReadStream(path)
	})

	ipcMain.handle('get-order', async (evt, arg) => {
		let config = getConfig()
		let grouping = config['order']['grouping'] || []
		let filtering = config['order']['filtering'] || []
		let result: any[] = orderSongs(arg, grouping, filtering)

		result = result.map(value => ({
			id: nanoid(),
			value
		}))

		return result
	})

	ipcMain.handle('get-config', async (evt, arg) => {
		let config = getConfig()
		return config
	})

	ipcMain.handle('search', async (evt, arg) => {
		// console.log('Main:',arg)
		const fuse = new Fuse(getStorageMapToArray(), {
			// keys: ['Artist', 'Title', 'Album', 'Composer', 'AlbumArtist'],
			keys: ['Title'],
			includeMatches: true
		})

		const result = fuse.search(arg)

		return result.slice(0, 100)
	})

	ipcMain.handle('save-peaks', async (evt, sourceFile, peaks) => {
		savePeaks(sourceFile, peaks)
		return ''
	})

	ipcMain.handle('edit-tags', async (evt, songList, newTags) => {
		tagEdit(songList, newTags)
		return ''
	})

	ipcMain.handle('get-peaks', async (evt, sourceFile) => {
		return await getPeaks(sourceFile)
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
		let docs = getStorageMap()
		let groupedSongs: any[] = []

		docs.forEach(doc => {
			doc.Songs.forEach(song => {
				if (song[groupBy] === groupByValue) {
					let rootDir = song.SourceFile.split('/').slice(0, -1).join('/')

					let foundAlbum = groupedSongs.find(i => i['RootDir'] === rootDir)

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
		return getStorageMap().get(albumID)
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

	ipcMain.handle('get-changes-progress', async evt => {
		return {
			total: getMaxTaskQueueLength(),
			current: getTaskQueueLength()
		}
	})

	ipcMain.handle('get-tag-edit-progress', () => {
		return getTagEditProgress()
	})
}
