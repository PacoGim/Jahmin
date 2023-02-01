import { stopSongsUpdating } from '../services/librarySongs.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('stop-song-update', async evt => {
		return await stopSongsUpdating()
	})
}
