import { contextBridge, ipcRenderer } from 'electron'

import type { ConfigType } from '../types/config.type'
import type { PartialSongType, SongType } from '../types/song.type'
import type { EqualizerProfileType } from '../types/equalizerProfile.type'
import type { ReturnMessageType } from '../types/returnMessage.type'

const ipcFunctions = {
	/********************** Renderer to Main (two-way) **********************/
	getConfig,
	getAlbumColors,
	getPeaks,
	getEqualizers,
	saveConfig,
	addNewEqualizerProfile,
	updateEqualizerValues,
	deleteEqualizer,
	renameEqualizer,
	stopSongUpdate,
	rebuildArtCache,
	saveLyrics,
	getLyrics,
	getLyricsList,
	/********************** Renderer to Main (one-way) **********************/
	sendAppReady: () => ipcRenderer.send('app-ready'),
	sendAllSongsToMain: (songs: any) => ipcRenderer.send('send-all-songs-to-main', songs),
	showContextMenu: (menuToOpen: string, parameters: any) => ipcRenderer.send('show-context-menu', menuToOpen, parameters),
	savePeaks: (sourceFile: string, peaks: number[]) => ipcRenderer.send('save-peaks', sourceFile, peaks),
	compressAlbumArt: (rootDir: string, artSize: number, forceNewCheck: boolean) =>
		ipcRenderer.send('handle-art-compression', rootDir, artSize, forceNewCheck),
	updateSongs: (songs: PartialSongType[], newTags: any) => ipcRenderer.send('update-songs', songs, newTags),
	compressSingleSongAlbumArt: (path: string, artSize: string, albumId: string) =>
		ipcRenderer.send('compress-single-song-album-art', path, albumId, artSize),
	selectDirectories: (type: 'add' | 'exclude', songs: SongType[]) => ipcRenderer.send('select-directories', type, songs),
	removeDirectory: (directory: string, type: 'remove-add' | 'remove-exclude', songs: SongType[]) =>
		ipcRenderer.send('remove-directory', directory, type, songs),
	handleArt: (filePath: string, elementId: string, size: number) => ipcRenderer.send('handle-art', filePath, elementId, size),
	/********************** Main to Renderer **********************/
	onGetAllSongsFromRenderer: (callback: any) => ipcRenderer.on('get-all-songs-from-renderer', callback),
	handleWebStorage: (callback: any) => ipcRenderer.on('web-storage', callback),
	handleNewImageArt: (callback: any) => ipcRenderer.on('new-image-art', callback),
	handleNewVideoArt: (callback: any) => ipcRenderer.on('new-video-art', callback),
	handleNewAnimationArt: (callback: any) => ipcRenderer.on('new-animation-art', callback),
	songSyncQueueProgress: (callback: any) => ipcRenderer.on('song-sync-queue-progress', callback),
	onArtQueueChange: (callback: any) => ipcRenderer.on('art-queue-length', callback),
	onShowLyrics: (callback: any) => ipcRenderer.on('show-lyrics', callback)
}

contextBridge.exposeInMainWorld('ipc', ipcFunctions)

function saveLyrics(lyrics: string, songTile: string, songArtist: string): Promise<string> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('save-lyrics', lyrics, songTile, songArtist)
			.then(response => resolve(response))
			.catch(err => reject(err))
	})
}

function getLyrics(songTile: string, songArtist: string): Promise<string> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-lyrics', songTile, songArtist)
			.then(response => resolve(response))
			.catch(err => reject(err))
	})
}

function getLyricsList(): Promise<{ title: string; artist: string }[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-lyrics-list')
			.then(response => resolve(response))
			.catch(err => reject(err))
	})
}

function getConfig(): Promise<ConfigType> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-config')
			.then(config => resolve(config))
			.catch(err => reject(err))
	})
}

function getPeaks(sourceFile: string) {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-peaks', sourceFile)
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function saveConfig(newConfig: ConfigType | any) {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('save-config', newConfig).then(result => {
			resolve(result)
		})
	})
}

function getEqualizers(): Promise<EqualizerProfileType[]> {
	return new Promise((resolve, reject) => {
		ipcRenderer.invoke('get-equalizers').then(result => {
			resolve(result)
		})
	})
}

function getAlbumColors(rootDir: string, contrastRatio: number) {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-album-colors', rootDir, contrastRatio)
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function addNewEqualizerProfile(newProfile: EqualizerProfileType) {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('add-new-equalizer-profile', newProfile)
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function deleteEqualizer(eqName: string): Promise<ReturnMessageType> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('delete-equalizer', eqName)
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function updateEqualizerValues(eqName: string, newValues: any): Promise<boolean> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('update-equalizer-values', eqName, newValues)
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function renameEqualizer(eqName: string, newName: string): Promise<ReturnMessageType> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('rename-equalizer', eqName, newName)
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function stopSongUpdate() {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('stop-song-update')
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function rebuildArtCache() {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('rebuild-art-cache')
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}
