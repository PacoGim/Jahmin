import { dialog } from 'electron'

import directoryHandlerService from '../services/directoryHandler.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('select-directories', (evt, type, dbSongs) => {
		dialog
			.showOpenDialog({
				properties: ['openDirectory', 'multiSelections']
			})
			.then(result => {
				if (result.canceled === false) {
					directoryHandlerService(result.filePaths, type, dbSongs)
				}
			})
			.catch(err => {
				console.log(err)
			})
	})
}
