import { BrowserWindow, dialog, ipcMain, IpcMainEvent } from 'electron'
import { loadContextMenu } from '../context_menu/contextMenu'
import { getAlbumColors } from '../functions/getAlbumColors.fn'
import cleanArtCacheFn from '../functions/clearArtCache.fn'

import { SongType } from '../../types/song.type'
import { compressAlbumArt } from './albumArt.service'
import { handleArtService } from './handleArt.service'
import appReadyService from './appReady.service'
import { unwatchPaths } from './chokidar.service'
import compressSingleSongAlbumArtService from './compressSingleSongAlbumArt.service'
import directoryHandlerService from './directoryHandler.service'
import { getConfig, saveConfig } from './config.service'
import { addEqualizer, deleteEqualizer, getEqualizers, renameEqualizer, updateEqualizerValues } from './equalizer.service'
import { addToTaskQueue, fetchSongsTag, stopSongsUpdating } from './librarySongs.service'
import { getPeaks, savePeaks } from './peaks.service'
import { EqualizerFileObjectType } from '../../types/equalizerFileObject.type'

let saveConfigDebounce: NodeJS.Timeout

export function startIPC() {
	/********************** One-way **********************/
	ipcMain.on('window-resize', event => windowResize(event))
	ipcMain.on('app-ready', appReadyService)
	ipcMain.on('send-all-songs-to-main', (evt, songsDb: SongType[]) => fetchSongsTag(songsDb))
	ipcMain.on('show-context-menu', (evt, menuToOpen: string, parameters: any) => loadContextMenu(evt, menuToOpen, parameters))
	ipcMain.on('save-peaks', (evt, sourceFile: string, peaks: number[]) => savePeaks(sourceFile, peaks))

	ipcMain.on('compress-single-song-album-art', async (evt, path, albumId, artSize) => {
		compressSingleSongAlbumArtService(path, artSize, albumId)
	})

	ipcMain.on('update-songs', (evt, songs: SongType[], newTags) => {
		let sourceFiles = songs.map(song => song.SourceFile)

		unwatchPaths(sourceFiles)

		songs.forEach(song => {
			addToTaskQueue(song.SourceFile, 'update', newTags)
		})
	})

	ipcMain.on('select-directories', (evt, type, dbSongs) => {
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

	ipcMain.on('remove-directory', (evt, directory, type: 'remove-add' | 'remove-exclude', dbSongs) => {
		directoryHandlerService([directory], type, dbSongs)
	})

	ipcMain.on('handle-art', (event, filePath: string, elementId: string, size: number) => {
		handleArtService(filePath, elementId, size)
	})

	/********************** Two-way **********************/
	ipcMain.handle('get-config', getConfig)
	ipcMain.handle('get-album-colors', async (evt, rootDir, contrastRatio) => await getAlbumColors(rootDir, contrastRatio))
	ipcMain.handle('get-peaks', async (evt, sourceFile) => await getPeaks(sourceFile))
	ipcMain.handle('get-equalizers', async evt => getEqualizers())
	ipcMain.handle('save-config', (evt, newConfig) => {
		return saveConfig(newConfig)
	})
	ipcMain.handle('add-new-equalizer-profile', async (evt, newProfile: EqualizerFileObjectType) => {
		return addEqualizer(newProfile)
	})
	ipcMain.handle('rename-equalizer', async (evt, eqName, newName) => {
		return renameEqualizer(eqName, newName)
	})
	ipcMain.handle('delete-equalizer', async (evt, eqName) => {
		return deleteEqualizer(eqName)
	})
	ipcMain.handle('update-equalizer-values', async (evt, eqName, newValues) => {
		return updateEqualizerValues(eqName, newValues)
	})

	ipcMain.handle('stop-song-update', async evt => {
		return await stopSongsUpdating()
	})

	ipcMain.handle('rebuild-art-cache', async evt => {
		return await cleanArtCacheFn()
	})
}

function windowResize(event: IpcMainEvent) {
	let window = BrowserWindow.fromId(event.frameId)

	if (window === null) return

	clearTimeout(saveConfigDebounce)

	saveConfigDebounce = setTimeout(() => {
		saveConfig({
			bounds: {
				x: window!.getPosition()[0],
				y: window!.getPosition()[1],
				width: window!.getSize()[0],
				height: window!.getSize()[1]
			}
		})
	}, 250)
}
