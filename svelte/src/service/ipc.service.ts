const { ipcRenderer } = require('electron')
import { albums, versioning } from '../store/index.store'
import type { SongType } from '../types/song.type'

export function getOrder(index: number): Promise<string[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-order', index).then((result) => {
			//TODO Gets called too many times
			resolve(result)
		})
	})
}

export function getConfig(): Promise<object> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-config').then((result) => {
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

export function getAlbums(): Promise<void> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-albums').then((result) => {
			albums.set(result)
			resolve()
			// When the results arrive, recursive call to wait for the eventual new filtering.
			getAlbums()
		})
	})
}

export function getCoverIPC(rootDir) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-cover', rootDir).then((result) => {
			resolve(result)
		})
	})
}

export function getAlbumIPC(albumID): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-album', albumID).then((result) => {
			resolve(result)
		})
	})
}

export function getAlbumColorsIPC(albumImagePath) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-album-colors', albumImagePath).then((result) => {
			resolve(result)
		})
	})
}

export function getDatabaseVersion() {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-database-version').then((result) => {
			setTimeout(() => {
				getDatabaseVersion()
			}, 10000)

			let storeVersion

			versioning.subscribe((value) => {
				storeVersion = value
			})()

			if (result !== 0 && result !== storeVersion) {
				console.log(storeVersion, result)
				versioning.set(result)
			}

			console.log(result)
			resolve(result)
		})
	})
}
