import { app } from 'electron'
import { setTitle, setArtist, setIsPlaying } from '../services/player.service'
import getDockMenuFn from '../functions/getDockMenu.fn'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('set-player-info', (evt, songTitle: string, songArtist: string, isPlaying: boolean) => {
		setTitle(songTitle)
		setArtist(songArtist)
		setIsPlaying(isPlaying)

		if (process.platform === 'darwin') {
			app.dock.setMenu(getDockMenuFn())
		}
	})
}
