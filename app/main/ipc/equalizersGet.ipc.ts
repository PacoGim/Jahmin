import { getEqualizers } from '../services/equalizer.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-equalizers', async evt => getEqualizers())
}
