import { getMainWindow } from '../main'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('set-progress-bar', async (_: any, progress: number) => {
		if (progress <= 0 || isNaN(progress)) {
			getMainWindow().setProgressBar(-1)
		} else {
			getMainWindow().setProgressBar(progress / 100)
		}
	})
}
