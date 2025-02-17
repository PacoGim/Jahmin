import { updateEqualizerValues } from '../services/equalizer.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('update-equalizer-values', async (evt, eqHash, newValues) => {
		return updateEqualizerValues(eqHash, newValues)
	})
}
