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
	deleteLyrics,
	getArtCacheSize,
	fileExists,
	getOs,
	getLangFile,
	getCommunityEqualizerProfiles,
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
	verifyFolderTegrity: (folderRoot: string) => ipcRenderer.send('verify-folder-tegrity', folderRoot),
	reloadApp: () => ipcRenderer.send('reload-app'),
	openGeniusWebpage: (songTitle: string, songArtist: string) => ipcRenderer.send('open-genius-webpage', songTitle, songArtist),
	/********************** Main to Renderer **********************/
	onGetAllSongsFromRenderer: (callback: any) => ipcRenderer.on('get-all-songs-from-renderer', callback),
	handleWebStorage: (callback: any) => ipcRenderer.on('web-storage', callback),
	handleNewImageArt: (callback: any) => ipcRenderer.on('new-image-art', callback),
	handleNewVideoArt: (callback: any) => ipcRenderer.on('new-video-art', callback),
	handleNewAnimationArt: (callback: any) => ipcRenderer.on('new-animation-art', callback),
	songSyncQueueProgress: (callback: any) => ipcRenderer.on('song-sync-queue-progress', callback),
	onArtQueueChange: (callback: any) => ipcRenderer.on('art-queue-length', callback),
	onShowLyrics: (callback: any) => ipcRenderer.on('show-lyrics', callback),
	onWebStorageBulkDelete: (callback: any) => ipcRenderer.on('web-storage-bulk-delete', callback),
	onSelectedDirectories: (callback: any) => ipcRenderer.on('selected-directories', callback),
	onAlbumAddToPlayback: (callback: any) => ipcRenderer.on('album-add-to-playback', callback),
	onAlbumPlayAfter: (callback: any) => ipcRenderer.on('album-play-after', callback),
	onAlbumPlayNow: (callback: any) => ipcRenderer.on('album-play-now', callback),
	onSongAddToPlayback: (callback: any) => ipcRenderer.on('song-add-to-playback', callback),
	onSongPlayAfter: (callback: any) => ipcRenderer.on('song-play-after', callback),
	onChangeSongAmount: (callback: any) => ipcRenderer.on('change-song-amount', callback),
	onMediaKeyPressed: (callback: any) => ipcRenderer.on('media-key-pressed', callback),
	onGlobalShortcutsRegistered: (callback: any) => ipcRenderer.on('global-shortcuts-registered', callback),
	onLyricsDeleted: (callback: any) => ipcRenderer.on('lyrics-deleted', callback),
	onConfirmLyricsDeletion: (callback: any) => ipcRenderer.on('confirm-lyrics-deletion', callback)
}

contextBridge.exposeInMainWorld('ipc', ipcFunctions)

function getCommunityEqualizerProfiles() {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-community-equalizer-profiles')
			.then(response => resolve(response))
			.catch(err => reject(err))
	})
}

function getLangFile() {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-lang-file')
			.then(response => resolve(JSON.parse(response)))
			.catch(err => reject(err))
	})
}

function getOs() {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-os')
			.then(response => resolve(response))
			.catch(err => reject(err))
	})
}

function fileExists(filePath: string) {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('file-exists', filePath)
			.then(response => resolve(response))
			.catch(err => reject(err))
	})
}

function deleteLyrics(title: string, artist: string) {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('delete-lyrics', title, artist)
			.then(response => resolve(response))
			.catch(err => reject(err))
	})
}

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

function deleteEqualizer(eqHash: string): Promise<ReturnMessageType> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('delete-equalizer', eqHash)
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function updateEqualizerValues(eqHash: string, newValues: any): Promise<boolean> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('update-equalizer-values', eqHash, newValues)
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

function renameEqualizer(eqHash: string, newName: string): Promise<ReturnMessageType> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('rename-equalizer', eqHash, newName)
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

function getArtCacheSize(): Promise<string> {
	return new Promise((resolve, reject) => {
		ipcRenderer
			.invoke('get-art-cache-size')
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}
