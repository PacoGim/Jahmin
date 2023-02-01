import { getPeaks } from '../services/peaks.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-peaks', async (evt, sourceFile) => await getPeaks(sourceFile))
}
