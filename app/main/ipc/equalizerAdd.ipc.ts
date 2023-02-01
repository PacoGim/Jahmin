import { EqualizerFileObjectType } from '../../types/equalizerFileObject.type'
import { addEqualizer } from '../services/equalizer.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('add-new-equalizer-profile', async (evt, newProfile: EqualizerFileObjectType) => {
		return addEqualizer(newProfile)
	})
}
