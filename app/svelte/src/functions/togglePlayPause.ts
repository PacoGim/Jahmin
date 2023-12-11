import { get } from 'svelte/store'
import { isPlaying, playingSongStore } from '../stores/main.store'
import { currentAudioPlayer, songToPlayUrlStore } from '../stores/player.store'

export default function () {
	let isPlayingLocal = get(isPlaying)
	let currentAudioPlayerLocal = get(currentAudioPlayer)
	let songToPlayUrlStoreLocal = get(songToPlayUrlStore)
	let playingSongStoreLocal = get(playingSongStore)

	if (isPlayingLocal) {
		currentAudioPlayerLocal.pause()
	} else {
		if (currentAudioPlayerLocal !== undefined && currentAudioPlayerLocal.src !== '') {
			currentAudioPlayerLocal.play().catch()
		} else {
			songToPlayUrlStoreLocal = [playingSongStoreLocal.SourceFile, { playNow: true }]
		}
	}
}
