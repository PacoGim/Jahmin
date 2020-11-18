import { ipcMain } from 'electron'
import { getCollection } from './loki.service'

export function loadIPC() {
	ipcMain.handle('get-songs', async (evt, arg) => {
		// let index = await createFilesIndex(collectionName)
		// scanFolders(collectionName,['/Volumes/Maxtor/Music'])
		// return index

		let docs = getCollection()

		return docs
	})

	ipcMain.handle('open-config', () => {
		console.log('Open Config File')
		// shell.showItemInFolder(configFilePath)
		return
	})
}
