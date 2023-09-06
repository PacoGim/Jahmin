const { shell } = require('electron')

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('open-genius-webpage', (evt, songTitle: string, songArtist: string) => {
		shell.openExternal(`https://genius.com/search?q=${songTitle} ${songArtist}`)
	})
}
