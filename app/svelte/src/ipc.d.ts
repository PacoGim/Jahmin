/// <reference types="svelte" />

import type { ConfigType } from '../../types/config.type'
import type { EqualizerProfileType } from '../../types/equalizerProfile.type'
import type { ReturnMessageType } from '../../types/returnMessage.type'
import { SongType } from '../../types/song.type'

export {}
declare global {
	interface Window {
		ipc: {
			getConfig: () => Promise<ConfigType>
			windowResize
			sendAppReady
			getAlbumColors
			savePeaks
			getPeaks
			getEqualizers
			saveConfig
			compressAlbumArt
			updateSongs
			handleNewArt
			compressSingleSongAlbumArt
			sendSingleSongArt
			selectDirectories: (type: 'add' | 'exclude', songs: SongType[]) => void
			removeDirectory: (directory: string, type: 'remove-add' | 'remove-exclude', songs: SongType[]) => void
			onGetAllSongsFromRenderer: (callback: any) => void
			sendAllSongsToMain: (songs: SongType[]) => void
			handleWebStorage: (callback: any) => void
			songSyncQueueProgress: (callback: any) => void
			showContextMenu: (menuToOpen: string, parameters: any) => void
			addNewEqualizerProfile: (newProfile: EqualizerProfileType) => Promise<ReturnMessageType>
			renameEqualizer: (eqName: string, newName: string) => Promise<ReturnMessageType>
			updateEqualizerValues: (eqName: string, newValues: any) => Promise<boolean>
			deleteEqualizer: (eqName: string) => Promise<ReturnMessageType>
			stopSongUpdate: () => Promise<>
		}
	}
}
