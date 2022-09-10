/// <reference types="svelte" />

import type { ConfigType } from '../../types/config.type'
import type { EqualizerProfileType } from '../../types/equalizerProfile.type'
import type { ReturnMessageType } from '../../types/returnMessage.type'
import { SongType } from '../../types/song.type'

export {}
declare global {
	interface Window {
		ipc: {
			/********************** Renderer to Main (two-way) **********************/
			getConfig: () => Promise<ConfigType>
			getPeaks
			getAlbumColors
			getEqualizers
			saveConfig
			addNewEqualizerProfile: (newProfile: EqualizerProfileType) => Promise<ReturnMessageType>
			renameEqualizer: (eqName: string, newName: string) => Promise<ReturnMessageType>
			updateEqualizerValues: (eqName: string, newValues: any) => Promise<boolean>
			deleteEqualizer: (eqName: string) => Promise<ReturnMessageType>
			stopSongUpdate: () => Promise<>
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
			/********************** Main to Renderer **********************/
			handleNewImageArt
			handleNewVideoArt
			handleNewAnimationArt
			sendSingleSongArt
			onGetAllSongsFromRenderer: (callback: any) => void
			handleWebStorage: (callback: any) => void
			songSyncQueueProgress: (callback: any) => void
		}
	}
}
