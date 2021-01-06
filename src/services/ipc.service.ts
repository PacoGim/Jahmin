import { ipcMain } from 'electron'
import { getConfig, saveConfig } from './config.service'
import { getCollection } from './loki.service'
import { orderSongs } from './songFilter.service'
// import { nanoid } from 'nanoid'
import { getAlbumArray, getNewPromiseAlbumArray } from './albumFiltering.service'
import { getAlbumCover } from './albumArt.service'
import { getAlbumColors } from './getAlbumColors.fn'

import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 20)

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

	ipcMain.handle('get-albums', async () => {
		// Waits for the filtering to be done then return the result.
		return await getNewPromiseAlbumArray()
	})

	ipcMain.handle('get-album-song', (evt, albumName) => {
		let albums = getAlbumArray().filter((x: any) => x['Album'] === albumName)
		return albums
	})

	ipcMain.handle('get-cover', async (evt, rootDir) => {
		return await getAlbumCover(rootDir)
	})

	ipcMain.handle('get-album-colors', async (evt, albumImagePath) => {
		return await getAlbumColors(albumImagePath)
	})
}
