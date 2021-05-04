const { ipcRenderer } = require('electron')

import { dbVersion } from '../store/final.store'
import type { AlbumType } from '../types/album.type'
import type { SongType } from '../types/song.type'

export function getOrderIPC(index: number): Promise<string[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-order', index).then((result) => {
			//TODO Gets called too many times
			resolve(result)
		})
	})
}

export function getGroupingIPC(valueToGroupBy: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-grouping', valueToGroupBy).then((result) => {
			resolve(result)
		})
	})
}

export function getConfigIPC(): Promise<object> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-config').then((result) => {
			resolve(result)
		})
	})
}

export function saveWaveformIPC(audioBuffer:AudioBuffer) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('save-waveform', audioBuffer).then((result) => {
			resolve(result)
		})
	})
}

export function saveConfig(newConfig: object) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('save-config', newConfig).then((result) => {
			resolve(result)
		})
	})
}

// TODO Dynamic
const sortBy = 'RootDir'

export function getAlbumsIPC(groupBy: string, groupByValue: string): Promise<any> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-albums', groupBy, groupByValue).then((result) => {
			result = result.sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])))
			resolve(result)
		})
	})
}

/*
	Show Songs ONLY by folders (For tagging by folder purpose) after selecting options, reload app.
*/
/*
export function getAlbumsIPC(): Promise<void> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-albums').then((result) => {
			result = result.sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])))

			albums.set(result)
			resolve()
			// When the results arrive, recursive call to wait for the eventual new filtering.
			getAlbumsIPC()
		})
	})
}

export function getAllAlbumsIPC(): Promise<void> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-all-albums').then((result) => {
			result = result.sort((a, b) => String(a['FolderName']).localeCompare(String(b['FolderName'])))
			console.log(result)

			albums.set(result)
			resolve()
		})
	})
}

*/

export function getCoverIPC(rootDir) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-cover', rootDir).then((result) => {
			resolve(result)
		})
	})
}

export function getAlbumIPC(albumID: string): Promise<AlbumType> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-album', albumID).then((result: AlbumType) => {
			if (result) {
				// TODO Add custom sorting.
				result.Songs = result.Songs.sort((a, b) => a.Track - b.Track)
				resolve(result)
			}
		})
	})
}

export function getAlbumColorsIPC(imageId) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-album-colors', imageId).then((result) => {
			resolve(result)
		})
	})
}

export function getChangesProgressIPC() {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-changes-progress').then((result) => {
			resolve(result)
		})
	})
}

export function getWaveformIPC(path): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			ipcRenderer.invoke('get-waveform', path).then((result) => {
				resolve(result)
			})
		} catch (error) {
			console.log('Oops', error)
		}
	})
}

export function showContextMenuIPC(menuToOpen, parameters) {
	ipcRenderer.send('show-context-menu', menuToOpen, parameters)
}

// export function getDatabaseVersionIPC() {
// 	return new Promise((resolve, reject) => {
// 		ipcRenderer.invoke('get-database-version').then((result) => {
// 			setTimeout(() => {
// 				getDatabaseVersionIPC()
// 			}, 10000)

// 			let storeVersion

// 			dbVersion.subscribe((value) => {
// 				storeVersion = value
// 			})()

// 			if (result !== 0 && result !== storeVersion) {
// 				console.log('New Version: ', result)
// 				dbVersion.set(result)
// 			}

// 			resolve(result)
// 		})
// 	})
// }

export function syncDbVersionIPC() {
	let storeDbVersion = undefined

	dbVersion.subscribe((value) => (storeDbVersion = value))()

	// Waits for the version to change in main.
	ipcRenderer.invoke('sync-db-version', storeDbVersion).then((result) => {
		dbVersion.set(result)

		console.log(result)

		syncDbVersionIPC()
	})
}
