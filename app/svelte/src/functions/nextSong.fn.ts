import {
	currentAudioElement,
	currentSongProgressStore,
	isAppIdle,
	playbackStore,
	playingSongStore,
	triggerScrollToSongEvent
} from '../stores/main.store'
import { songToPlayUrlStore } from '../stores/player.store'
import type { PartialSongType, SongType } from '../../../types/song.type'
import { get } from 'svelte/store'

export default function () {
	let playbackStoreLocal: SongType[]
	let songPlayingLocal: SongType | PartialSongType = undefined

	playbackStore.subscribe(value => (playbackStoreLocal = value))()
	playingSongStore.subscribe(value => (songPlayingLocal = value))()

	let currentSongIndex = playbackStoreLocal.findIndex(song => song.ID === songPlayingLocal.ID)
	let nextSongIndex = currentSongIndex + 1

	let nextSong = playbackStoreLocal[nextSongIndex]

	if (nextSong === undefined) {
		let currentSong = playbackStoreLocal[currentSongIndex]
		// currentSongProgressStore.set(0)

		if (currentSong?.SourceFile) {
			songToPlayUrlStore.set([currentSong.SourceFile, { playNow: false }])
		}
	} else {
		songToPlayUrlStore.set([nextSong.SourceFile, { playNow: true }])

		if (get(isAppIdle) === true) {
			triggerScrollToSongEvent.set(nextSong.ID)
		}
	}
}
