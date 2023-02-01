import { deleteEqualizer } from '../services/equalizer.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('delete-equalizer', async (evt, eqName) => {
		return deleteEqualizer(eqName)
	})
}
