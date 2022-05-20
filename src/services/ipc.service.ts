import { ipcMain, dialog } from 'electron'
import { getConfig, saveConfig } from './config.service'
// import { getCollectionMap, getNewPromiseDbVersion } from './loki.service.bak'
import { orderSongs } from './songFilter.service'
import { compressAlbumArt, sendArtQueueProgress } from './albumArt.service'
import { getAlbumColors } from './getAlbumColors.fn'
import { customAlphabet } from 'nanoid'
// import { getTotalChangesToProcess, getTotalProcessedChanged } from './folderWatcher.service'
import { hash } from '../functions/hashString.fn'
import {
	addToTaskQueue,
	getMaxTaskQueueLength,
	getTaskQueueLength,
	sendSongSyncQueueProgress,
	stopSongsUpdating,
	watchFolders
} from './songSync.service'
import { getPeaks, savePeaks } from './peaks'
import { getTagEditProgress, tagEdit } from './tagEdit.service'
// import { getTagEditProgress } from '../functions/getTagEditProgress.fn'
import { getFuzzyList, getNewPromiseDbVersion, getStorageMap, getStorageMapToArray } from './storage.service'
import { loadContextMenu } from '../context_menu/contextMenu'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 20)

import fs from 'fs'

import Fuse from 'fuse.js'
import {
	addEqualizer,
	deleteEqualizer,
	getEqFolderPath,
	getEqualizers,
	renameEqualizer,
	updateEqualizerValues
} from './equalizer.service'
import { EqualizerFileObjectType } from '../types/equalizerFileObject.type'
import { shell } from 'electron/common'
import { groupSongs } from './songGroup.service'
import { sendWebContents } from './sendWebContents.service'
import directoryHandlerService from './directoryHandler.service'
import hashFileFn from '../functions/hashFile.fn'
import appReadyService from './appReady.service'
import { SongType } from '../types/song.type'
import deepmerge from 'deepmerge'

export function loadIPC() {
	ipcMain.on('show-context-menu', (event, menuToOpen, parameters) => loadContextMenu(event, menuToOpen, parameters))

	ipcMain.handle('rename-equalizer', async (evt, eqId, newName) => {
		return renameEqualizer(eqId, newName)
	})

	ipcMain.handle('delete-equalizer', async (evt, eqId) => {
		return deleteEqualizer(eqId)
	})

	ipcMain.handle('update-equalizer-values', async (evt, eqId, newValues) => {
		return updateEqualizerValues(eqId, newValues)
	})

	ipcMain.handle('add-new-equalizer-profile', async (evt, newProfile: EqualizerFileObjectType) => {
		return addEqualizer(newProfile)
	})

	// ipcMain.handle('group-songs', async (evt, groups: string[], groupValues: string[]) => {
	// 	return groupSongs(groups, groupValues)
	// })

	// ipcMain.handle('get-order', async (evt, arg) => {
	// 	let config = getConfig()
	// 	let grouping = config.order?.grouping || []
	// 	let filtering = config.order?.filtering || []
	// 	let result: any[] = orderSongs(arg, grouping, filtering)

	// 	result = result.map(value => ({
	// 		id: nanoid(),
	// 		value
	// 	}))

	// 	return result
	// })

	ipcMain.handle('get-config', async (evt, arg) => {
		let config = getConfig()
		return config
	})

	ipcMain.handle('search', async (evt, searchString, keys: string[]) => {
		if (keys.includes('Album Artist')) {
			keys.splice(keys.indexOf('Album Artist'), 1)
			keys.push('AlbumArtist')
		}

		const fuse = new Fuse(getStorageMapToArray(), {
			keys
		})

		let result = fuse.search(searchString, { limit: 20 })

		return result
	})

	ipcMain.handle('get-equalizers', async evt => {
		return getEqualizers()
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

	// ipcMain.handle('get-grouping', async (evt, valueToGroupBy) => {
	// 	return groupSongs(valueToGroupBy)
	// })

	ipcMain.handle('save-config', (evt, newConfig) => {
		return saveConfig(newConfig)
	})

	ipcMain.handle('open-config', () => {
		// shell.showItemInFolder(configFilePath)
		return
	})

	ipcMain.handle('show-equalizer-folder', () => {
		shell.openPath(getEqFolderPath())
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

	ipcMain.handle('is-file-exist', (evt, filePath) => {
		return fs.existsSync(filePath)
	})

	ipcMain.handle('get-album', (evt, albumID) => {
		return getStorageMap().get(albumID)
	})
	/*
	ipcMain.handle('get-art', async (evt, albumId, artSize, elementId) => {
		getAlbumArt(albumId, artSize, elementId)
	})
	 */

	ipcMain.handle('get-file-hash', async (evt, filePath) => {
		return await hashFileFn(filePath)
	})

	ipcMain.handle('stop-song-update', async evt => {
		return await stopSongsUpdating()
	})

	ipcMain.handle('handle-art-compression', async (evt, rootDir, artSize, forceNewCheck) => {
		compressAlbumArt(rootDir, artSize, forceNewCheck)
	})

	ipcMain.handle('get-album-colors', async (evt, rootDir, contrastRatio) => {
		return await getAlbumColors(rootDir, contrastRatio)
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

	ipcMain.handle('send-new-art-queue-progress', () => {
		sendArtQueueProgress()
		return true
	})

	ipcMain.handle('select-directories', (evt, type, dbSongs) => {
		dialog
			.showOpenDialog({
				properties: ['openDirectory', 'multiSelections']
			})
			.then(result => {
				if (result.canceled === false) {
					directoryHandlerService(result.filePaths, type, dbSongs)
				}
			})
			.catch(err => {
				console.log(err)
			})
	})

	ipcMain.handle('remove-directory', (evt, directory, type: 'remove-add' | 'remove-exclude', dbSongs) => {
		directoryHandlerService([directory], type, dbSongs)
	})

	ipcMain.handle('run-song-fetch', (evt, songDb) => {
		watchFolders(songDb)
	})

	ipcMain.handle('app-ready', (evt, songDb) => {
		appReadyService()
	})

	ipcMain.handle('send-all-songs-from-renderer', (evt, songsDb: SongType[]) => {
		watchFolders(songsDb)
	})

	ipcMain.handle('update-songs', (evt, songs: SongType[], newTags) => {
		songs.forEach(song => {
			addToTaskQueue(song.SourceFile, 'update', newTags)
		})
	})
}
