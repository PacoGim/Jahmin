/// <reference types="svelte" />

import type { ConfigType, PartialConfigType } from '../../types/config.type'
import type { EqualizerProfileType } from '../../types/equalizerProfile.type'
import type { ReturnMessageType } from '../../types/returnMessage.type'
import type { PromiseResolveType } from '../../types/promiseResolve.type'
import { SongType } from '../../types/song.type'
import { DatabaseResponseType } from '../../types/databaseWorkerMessage.type'

export {}
declare global {
	interface Window {
		ipc: {
			/********************** Renderer to Main (two-way) **********************/
			getConfig: () => Promise<ConfigType>
			getPeaks
			getAlbumColors
			getEqualizers
			saveConfig: (config: PartialConfigType<ConfigType>) => Promise<ConfigType>
			addNewEqualizerProfile: (newProfile: EqualizerProfileType) => Promise<ReturnMessageType>
			renameEqualizer: (eqHash: string, newName: string) => Promise<ReturnMessageType>
			updateEqualizerValues: (eqName: string, newValues: any) => Promise<EqualizerProfileType>
			deleteEqualizer: (eqHash: string) => Promise<ReturnMessageType>
			stopSongUpdate: () => Promise<>
			rebuildArtCache: () => Promise<>
			saveLyrics: (lyrics: string, songTile: string, songArtist: string) => Promise<PromiseResolveType>
			getLyrics: (songTile: string, songArtist: string) => Promise<PromiseResolveType>
			getLyricsList: () => Promise<{ title: string; artist: string }[]>
			deleteLyrics: (title: string, artist: string) => Promise<PromiseResolveType>
			getArtCacheSize: () => Promise<string>
			fileExists: (filePath: string) => Promise<boolean>
			getOs: () => Promise<string>
			getLangFile: () => Promise<Object>
			getCommunityEqualizerProfiles: () => Promise<EqualizerProfileType[]>
			/********************** Renderer to Main (one-way) **********************/
			sendAppReady
			sendAllSongsToMain: (songs: SongType[]) => void
			showContextMenu: (menuToOpen: string, parameters: any) => void
			savePeaks
			compressAlbumArt
			updateSongs
			compressSingleSongAlbumArt
			selectDirectories: (type: 'add' | 'exclude', songs: SongType[]) => void
			removeDirectory: (directory: string, type: 'remove-add' | 'remove-exclude', songs: SongType[]) => void
			handleArt: (filePath: string, elementId: string, size: number) => void
			verifyFolderTegrity: (folderRoot: string) => void
			reloadApp: () => void
			openGeniusWebpage: (songTitle: string, songArtist: string) => void
			/********************** Main to Renderer **********************/
			handleNewImageArt
			handleNewVideoArt
			handleNewAnimationArt
			sendSingleSongArt
			onGetAllSongsFromRenderer: (callback: any) => void
			handleWebStorage: (callback: any) => void
			songSyncQueueProgress: (callback: any) => void
			onArtQueueChange: (callback: any) => void
			onShowLyrics: (callback: any) => void
			onWebStorageBulkDelete: (callback: any) => void
			onSelectedDirectories: (callback: any) => void
			onAlbumAddToPlayback: (callback: any) => void
			onAlbumPlayAfter: (callback: any) => void
			onAlbumPlayNow: (callback: any) => void
			onSongAddToPlayback: (callback: any) => void
			onSongPlayAfter: (callback: any) => void
			onChangeSongAmount: (callback: any) => void
			onMediaKeyPressed: (callback: any) => void
			onGlobalShortcutsRegistered: (callback: any) => void
			onLyricsDeleted: (callback: any) => void
			onConfirmLyricsDeletion: (callback: any) => void
			onDatabaseUpdate: (callback: any) => void
			onGroupSelected: (callback: any) => void
			onSortsongs: (callback: any) => void
			/********************** Database **********************/
			bulkRead: (data: {
				queryId?: string
				queryData: {
					select: string[]
					andWhere?: { [key: string]: string }[]
					orWhere?: { [key: string]: string }[]
					group?: string[]
					order?: string[]
				}
			}) => Promise<DatabaseResponseType>
			updatePlayCount: (
				songId: number,
				type: 'reset' | 'increment'
			) => Promise<{
				ID: number
				PlayCount: number
			}>
		}
	}
}
