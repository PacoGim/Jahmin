import { ipcMain } from 'electron'

export async function startIPC() {
	/********************** One-way **********************/
	await (await import('../ipc/windowResize.ipc')).default(ipcMain)
	await (await import('../ipc/appReady.ipc')).default(ipcMain)
	await (await import('../ipc/sendAllSongsToMain.ipc')).default(ipcMain)
	await (await import('../ipc/showContextMenu.ipc')).default(ipcMain)
	await (await import('../ipc/savePeaks.ipc')).default(ipcMain)
	await (await import('../ipc/updateSongs.ipc')).default(ipcMain)
	await (await import('../ipc/selectDirectories.ipc')).default(ipcMain)
	await (await import('../ipc/removeDirectory.ipc')).default(ipcMain)
	await (await import('../ipc/handleArt.ipc')).default(ipcMain)
	await (await import('../ipc/verifyFolderTegrity.ipc')).default(ipcMain)

	/********************** Two-way **********************/
	await (await import('../ipc/configGet.ipc')).default(ipcMain)
	await (await import('../ipc/getAlbumColors.ipc')).default(ipcMain)
	await (await import('../ipc/getPeaks.ipc')).default(ipcMain)
	await (await import('../ipc/configSave.ipc')).default(ipcMain)
	await (await import('../ipc/stopSongUpdate.ipc')).default(ipcMain)
	await (await import('../ipc/rebuildArtCache.ipc')).default(ipcMain)
	await (await import('../ipc/getArtCacheSize.ipc')).default(ipcMain)
	await (await import('../ipc/fileExists.ipc')).default(ipcMain)
	await (await import('../ipc/equalizerAdd.ipc')).default(ipcMain)
	await (await import('../ipc/equalizersGet.ipc')).default(ipcMain)
	await (await import('../ipc/equalizerRename.ipc')).default(ipcMain)
	await (await import('../ipc/equalizerDelete.ipc')).default(ipcMain)
	await (await import('../ipc/equalizerUpdate.ipc')).default(ipcMain)
	await (await import('../ipc/lyricsSave.ipc')).default(ipcMain)
	await (await import('../ipc/lyricsGet.ipc')).default(ipcMain)
	await (await import('../ipc/lyricsListGet.ipc')).default(ipcMain)
	await (await import('../ipc/lyricsDelete.ipc')).default(ipcMain)
}
