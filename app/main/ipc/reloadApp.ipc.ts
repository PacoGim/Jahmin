import { getMainWindow } from '../main'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('reload-app', () => {
		getMainWindow().reload()
	})
}
