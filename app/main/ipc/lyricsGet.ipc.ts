import { getLyrics } from '../services/lyrics.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-lyrics', async (evt, songTile, songArtist) => {
		return await getLyrics(songTile, songArtist)
	})
}
