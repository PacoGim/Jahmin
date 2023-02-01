import { getConfig } from '../services/config.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-config', getConfig)
}
