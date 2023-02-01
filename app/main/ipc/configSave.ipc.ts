import { saveConfig } from '../services/config.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('save-config', (evt, newConfig) => {
		return saveConfig(newConfig)
	})
}
