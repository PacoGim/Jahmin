import { currentAudioElement, isPlaying, playingSongStore } from '../stores/main.store'
import { songToPlayUrlStore } from '../stores/player.store'

export default function () {
	let isPlayingLocal
	let currentAudioElementLocal
	let songToPlayUrlStoreLocal
	let playingSongStoreLocal

	isPlaying.subscribe(value => (isPlayingLocal = value))()
	currentAudioElement.subscribe(value => (currentAudioElementLocal = value))()
	songToPlayUrlStore.subscribe(value => (songToPlayUrlStoreLocal = value))()
	playingSongStore.subscribe(value => (playingSongStoreLocal = value))()

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
