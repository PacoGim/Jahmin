import { get } from 'svelte/store'
import { currentAudioElement, isPlaying, playingSongStore } from '../stores/main.store'
import { songToPlayUrlStore } from '../stores/player.store'

export default function () {
	let isPlayingLocal = get(isPlaying)
	let currentAudioElementLocal = get(currentAudioElement)
	let songToPlayUrlStoreLocal = get(songToPlayUrlStore)
	let playingSongStoreLocal = get(playingSongStore)

	if (isPlayingLocal) {
		currentAudioElementLocal.pause()
	} else {
		if (currentAudioElementLocal !== undefined && currentAudioElementLocal.src !== '') {
			currentAudioElementLocal.play().catch()
		} else {
			songToPlayUrlStoreLocal = [playingSongStoreLocal.SourceFile, { playNow: true }]
		}
	}
}
