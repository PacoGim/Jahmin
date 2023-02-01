import cleanArtCacheFn from '../functions/clearArtCache.fn'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('rebuild-art-cache', async evt => {
		return await cleanArtCacheFn()
	})
}
