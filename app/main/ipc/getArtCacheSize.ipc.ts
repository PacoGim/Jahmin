import getArtCacheSizeFn from '../functions/getArtCacheSize.fn'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-art-cache-size', async () => {
		return getArtCacheSizeFn()
	})
}
