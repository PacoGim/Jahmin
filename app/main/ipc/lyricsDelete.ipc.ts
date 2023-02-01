import { deleteLyrics } from '../services/lyrics.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('delete-lyrics', async (evt, title: string, artist: string) => {
		return await deleteLyrics(title, artist)
	})
}
