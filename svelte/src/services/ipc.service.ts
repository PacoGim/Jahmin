const { ipcRenderer } = require('electron')

import { getAllSongs } from '../db/db'
import sortSongsArrayFn from '../functions/sortSongsArray.fn'
import { albumArtMapStore, dbVersionStore } from '../store/final.store'
import type { AlbumType } from '../types/album.type'
import type { ConfigType } from '../types/config.type'
import type { EqualizerType } from '../types/equalizer.type'
import type { EqualizerProfileType } from '../types/equalizerProfile.type'
import type { ReturnMessageType } from '../types/returnMessage.type'
import type { SongFuzzySearchType, SongType } from '../types/song.type'

let isGetTagEditProgressRunning = false

// export function groupSongsIPC(groups: string[], groupValues: string[]): Promise<any> {
// 	return new Promise((resolve, reject) => {
// 		ipcRenderer.invoke('group-songs', groups, groupValues).then(result => {
// 			resolve(result)
// 		})
// 	})
// }

export function sendAllSongsFromRendererIPC() {
	getAllSongs().then(songs => {
		ipcRenderer.invoke('send-all-songs-from-renderer', songs)
	})
}

export function sendAppReadyIPC() {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('app-ready')
	})
}

export function userSearchIPC(searchString: string, keys: string[]): Promise<SongFuzzySearchType[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('search', searchString, keys).then(result => {
			resolve(result)
		})
	})
}

export function getEqualizersIPC(): Promise<EqualizerProfileType[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-equalizers').then(result => {
			resolve(result)
		})
	})
}

export function renameEqualizerIPC(eqId: string, newName: string): Promise<ReturnMessageType> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('rename-equalizer', eqId, newName).then(result => {
			resolve(result)
		})
	})
}

export function showEqualizerFolderIPC() {
	ipcRenderer.invoke('show-equalizer-folder')
}

export function deleteEqualizerIPC(eqId: string): Promise<ReturnMessageType> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('delete-equalizer', eqId).then(result => {
			resolve(result)
		})
	})
}

export function updateEqualizerValuesIPC(eqId: string, newValues: any): Promise<boolean> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('update-equalizer-values', eqId, newValues).then(result => {
			resolve(result)
		})
	})
}

export function addNewEqualizerProfileIPC(newProfile: EqualizerProfileType): Promise<ReturnMessageType> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('add-new-equalizer-profile', newProfile).then(result => {
			resolve(result)
		})
	})
}

export function getTagEditProgressIPC(): Promise<string[]> {
	return new Promise((resolve, reject) => {
		if (!isGetTagEditProgressRunning) {
			isGetTagEditProgressRunning = true

			ipcRenderer.invoke('get-tag-edit-progress').then(result => {
				isGetTagEditProgressRunning = false
				let percentage = (100 / result?.maxLength) * result?.currentLength

				console.log(percentage)

				if (percentage !== 0) {
					setTimeout(() => {
						getTagEditProgressIPC()
					}, 2000)
				}

				resolve(result)
			})
		}
	})
}

export function getTasksToSyncIPC(): Promise<any[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('sync-tasks').then(result => {
			resolve(result)
		})
	})
}

export function getOrderIPC(index: number): Promise<string[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-order', index).then(result => {
			resolve(result)
		})
	})
}

export function getGroupingIPC(valueToGroupBy: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-grouping', valueToGroupBy).then(result => {
			resolve(result)
		})
	})
}

export function getConfigIPC(): Promise<object> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-config').then(result => {
			resolve(result)
		})
	})
}

export function editTagsIPC(songList: string[], newTags: Object): Promise<number[] | undefined> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('edit-tags', songList, newTags).then(response => {
			resolve(response)
		})
	})
}

export function savePeaksIPC(sourceFile: string, peaks: number[]): Promise<number[] | undefined> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('save-peaks', sourceFile, peaks).then((result: number[] | undefined) => {
			resolve(result)
		})
	})
}

export function getPeaksIPC(sourceFile: string) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-peaks', sourceFile).then(result => {
			resolve(result)
		})
	})
}

export function saveConfig(newConfig: ConfigType | any) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('save-config', newConfig).then(result => {
			resolve(result)
		})
	})
}

// TODO Add Option to sort albums
const sortBy = 'RootDir'

export function getAlbumsIPC(groupBy: string, groupByValue: string): Promise<any> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-albums', groupBy, groupByValue).then(result => {
			result = result.sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])))
			resolve(result)
		})
	})
}

export function sendNewArtQueueProgressIPC(): void {
	ipcRenderer.invoke('send-new-art-queue-progress')
}

export function compressAlbumArtIPC(rootDir, artSize, forceNewCheck: boolean) {
	ipcRenderer.invoke('handle-art-compression', rootDir, artSize, forceNewCheck)
}

export function stopSongUpdateIPC() {
	return new Promise(resolve => {
		ipcRenderer.invoke('stop-song-update').then(() => {
			resolve(null)
		})
	})
}

export function getFileHashIPC(filePath: string) {
	return new Promise((resolve, reject) => {
		resolve(ipcRenderer.invoke('get-file-hash', filePath))
	})
}

export function isFileExistIPC(filePath: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		resolve(ipcRenderer.invoke('is-file-exist', filePath))
	})
}

export function getAlbumIPC(albumId: string): Promise<AlbumType> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-album', albumId).then((result: AlbumType) => {
			if (result) {
				let sorting = JSON.parse(localStorage.getItem('sorting')) || undefined

				if (sorting) {
					result.Songs = sortSongsArrayFn(result.Songs, sorting.tag, sorting.order)
				} else {
					result.Songs = sortSongsArrayFn(result.Songs, 'Track', 1)
				}

				resolve(result)
			}
		})
	})
}

export function getAlbumColorsIPC(rootDir, contrastRatio) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-album-colors', rootDir, contrastRatio).then(result => {
			resolve(result)
		})
	})
}

export function getChangesProgressIPC() {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-changes-progress').then(result => {
			resolve(result)
		})
	})
}

export function selectDirectoriesIPC(type: 'add' | 'exclude') {
	getAllSongs().then(songs => {
		ipcRenderer.invoke('select-directories', type, songs)
	})
	return
}

export function removeDirectoryIPC(directory: string, type: 'remove-add' | 'remove-exclude') {
	getAllSongs().then(songs => {
		ipcRenderer.invoke('remove-directory', directory, type, songs)
	})
	return
}

export function runSongFetchIPC(songDb: SongType[]) {
	ipcRenderer.invoke('run-song-fetch', songDb)
	return
}

export function showContextMenuIPC(menuToOpen, parameters) {
	ipcRenderer.send('show-context-menu', menuToOpen, parameters)
}

export function updateSongsIPC(songs: SongType[], newTags: any) {
	ipcRenderer.invoke('update-songs', songs, newTags)
}
