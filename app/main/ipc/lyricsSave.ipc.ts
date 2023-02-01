import { saveLyrics } from '../services/lyrics.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('save-lyrics', async (evt, lyrics, songTile, songArtist) => {
		return await saveLyrics(lyrics, songTile, songArtist)
	})
}
