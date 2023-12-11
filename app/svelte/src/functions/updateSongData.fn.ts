import { get } from 'svelte/store'
import type { SongType } from '../../../types/song.type'
import { playingSongStore } from '../stores/main.store'
import getDirectoryFn from './getDirectory.fn'
import getAlbumColorsFn from './getAlbumColors.fn'
import { configStore } from '../stores/config.store'
import applyColorSchemeFn from './applyColorScheme.fn'
import { setWaveSource } from '../services/waveform.service'
import setMediaSessionDataFn from './setMediaSessionData.fn'

/**
 *
 * @param song SongType
 * @description Updates the song data
 */
export default function (song: SongType) {
	let songRootFolder = getDirectoryFn(song.SourceFile)

	playingSongStore.set(song)

	getAlbumColorsFn(songRootFolder, get(configStore).userOptions.contrastRatio).then(color => {
		applyColorSchemeFn(color)
	})

	setWaveSource(song.SourceFile, songRootFolder, song.Duration)

	localStorage.setItem('LastPlayedSongId', String(song.ID))
	localStorage.setItem('LastPlayedDir', String(songRootFolder))

	setMediaSessionDataFn(song)
}
