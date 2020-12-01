import { ipcMain } from 'electron'
import { getConfig, saveConfig } from './config.service'
import { getCollection } from './loki.service'
import { orderSongs } from './songFilter.service'
import { nanoid } from 'nanoid'

export function loadIPC() {
	ipcMain.handle('get-songs', async (evt, arg) => {
		console.log('IPC Get Songs')
		// let index = await createFilesIndex(collectionName)
		// scanFolders(collectionName,['/Volumes/Maxtor/Music'])
		// return index

		let docs = getCollection()

		return docs
	})

	ipcMain.handle('get-order', async (evt, arg) => {
		console.log('IPC Get Order')
		let config = getConfig()
		let grouping = config['order']['grouping'] || []
		let filtering = config['order']['filtering'] || []
		let result: any[] = orderSongs(arg, grouping, filtering)

		// result=result.map((value)=>{id:nanoid(),item:value})
		result = result.map((value) => ({
			id: nanoid(),
			value
		}))

		return result
	})

	ipcMain.handle('get-config', async (evt, arg) => {
		let config = getConfig()
		return config
	})

	ipcMain.handle('save-config', (evt, newConfig) => {
		return saveConfig(newConfig)
	})

	ipcMain.handle('open-config', () => {
		console.log('Open Config File')
		// shell.showItemInFolder(configFilePath)
		return
	})
}
