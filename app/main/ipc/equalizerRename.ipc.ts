import { renameEqualizer } from '../services/equalizer.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('rename-equalizer', async (evt, eqName, newName) => {
		return renameEqualizer(eqName, newName)
	})
}
