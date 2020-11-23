import { ipcMain } from 'electron'
import { getConfig } from './config.service'
import { getCollection } from './loki.service'
import { orderSongs } from './songFilter.service'

export function loadIPC() {
	ipcMain.handle('get-songs', async (evt, arg) => {
		// let index = await createFilesIndex(collectionName)
		// scanFolders(collectionName,['/Volumes/Maxtor/Music'])
		// return index

		let docs = getCollection()

		return docs
	})

	ipcMain.handle('get-order', async (evt, arg) => {
		let config = getConfig()
		let grouping = config['order']['grouping'] || []
		let filtering = config['order']['filtering'] || []
		let result = orderSongs(arg, grouping, filtering)

		return result
	})

	ipcMain.handle('get-config', async (evt, arg) => {
		let config = getConfig()
		return config
	})

	ipcMain.handle('open-config', () => {
		console.log('Open Config File')
		// shell.showItemInFolder(configFilePath)
		return
	})
}
