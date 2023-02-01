import { getLyricsList } from '../services/lyrics.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-lyrics-list', async () => {
		return await getLyricsList()
	})
}
