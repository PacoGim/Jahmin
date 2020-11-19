import { ipcMain } from 'electron'
import { getConfig } from './config.service'
import { getCollection } from './loki.service'

export function loadIPC() {
	ipcMain.handle('get-songs', async (evt, arg) => {
		// let index = await createFilesIndex(collectionName)
		// scanFolders(collectionName,['/Volumes/Maxtor/Music'])
		// return index

		let docs = getCollection()

		return docs
	})

	ipcMain.handle('get-order', async (evt, arg) => {
		let result = orderSongs(arg)

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

function orderSongs(index: number) {
	let config = getConfig()
	let grouping = config['order']['grouping']
	let filtering = config['order']['filtering']
	let songs = getCollection()
	let tempArray: string[] = []
	let filteredArray = []

	console.log('----------')

	for (let i = 0; i <= index; i++) {
		// If i === index means that it should be grouping since user selection does not matter now.
		if (i === index) {
			if (filteredArray.length === 0) {
				filteredArray = songs
			}

			filteredArray.forEach((song) => {
				let value = song[grouping[index]]
				if (!tempArray.includes(value)) {
					tempArray.push(value)
				}
			})
		} else {
			// console.log('Filter',config['order']['grouping'][i],config['order']['grouping'][index])
		}
	}

	tempArray = tempArray.sort((a, b) => String(a).localeCompare(String(b)))

	return tempArray
}
