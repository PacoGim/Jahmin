import directoryHandlerService from '../services/directoryHandler.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('remove-directory', (evt, directory, type: 'remove-add' | 'remove-exclude') => {
		directoryHandlerService([directory], type)
	})
}
