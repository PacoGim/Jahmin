import { ipcMain } from 'electron'

/********************** Types **********************/
import { EqualizerFileObjectType } from '../../types/equalizerFileObject.type'

/********************** Functions **********************/
import { getAlbumColors } from '../functions/getAlbumColors.fn'
import cleanArtCacheFn from '../functions/clearArtCache.fn'
import getArtCacheSizeFn from '../functions/getArtCacheSize.fn'
import fileExistsFn from '../functions/fileExists.fn'

/********************** Services **********************/
import { handleArtService } from './handleArt.service'
import { getConfig, saveConfig } from './config.service'
import { addEqualizer, deleteEqualizer, getEqualizers, renameEqualizer, updateEqualizerValues } from './equalizer.service'
import { stopSongsUpdating } from './librarySongs.service'
import { getPeaks } from './peaks.service'
import { getLyrics, getLyricsList, saveLyrics, deleteLyrics } from './lyrics.service'

/********************** IPC **********************/
import windowResizeIpc from '../ipc/windowResize.ipc'
import appReadyIpc from '../ipc/appReady.ipc'
import sendAllSongsToMainIpc from '../ipc/sendAllSongsToMain.ipc'
import showContextMenuIpc from '../ipc/showContextMenu.ipc'
import savePeaksIpc from '../ipc/savePeaks.ipc'
import updateSongsIpc from '../ipc/updateSongs.ipc'
import selectDirectoriesIpc from '../ipc/selectDirectories.ipc'

import removeDirectoryIpc from '../ipc/removeDirectory.ipc'

export function startIPC() {
	/********************** One-way **********************/
	windowResizeIpc(ipcMain)
	appReadyIpc(ipcMain)
	sendAllSongsToMainIpc(ipcMain)
	showContextMenuIpc(ipcMain)
	savePeaksIpc(ipcMain)
	updateSongsIpc(ipcMain)
	selectDirectoriesIpc(ipcMain)
	removeDirectoryIpc(ipcMain)

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

	ipcMain.handle('save-lyrics', async (evt, lyrics, songTile, songArtist) => {
		return await saveLyrics(lyrics, songTile, songArtist)
	})

	ipcMain.handle('get-lyrics', async (evt, songTile, songArtist) => {
		return await getLyrics(songTile, songArtist)
	})

	ipcMain.handle('get-lyrics-list', async () => {
		return await getLyricsList()
	})

	ipcMain.handle('delete-lyrics', async (evt, title: string, artist: string) => {
		return await deleteLyrics(title, artist)
	})

	ipcMain.handle('get-art-cache-size', async () => {
		return getArtCacheSizeFn()
	})

	ipcMain.handle('file-exists', async (evt, filePath: string) => {
		return fileExistsFn(filePath)
	})
}
