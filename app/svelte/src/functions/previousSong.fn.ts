import { playbackStore, playingSongStore, triggerScrollToSongEvent, isAppIdle } from '../stores/main.store'
import { currentAudioPlayer, songToPlayUrlStore } from '../stores/player.store'
import type { PartialSongType, SongType } from '../../../types/song.type'
import { get } from 'svelte/store'
import { stopPlayerProgressFunction } from '../stores/functions.store'

let currentAudioElementLocal: HTMLAudioElement = undefined

let currentAudioElementSubscription = currentAudioPlayer.subscribe(value => {
	if (value !== undefined) {
		currentAudioElementLocal = value

		currentAudioElementSubscription()
	}
})

export default function ({ force }: { force: boolean } = { force: false }) {
	let playbackStoreValue: SongType[] = get(playbackStore)
	let songPlayingLocal: PartialSongType = get(playingSongStore)

	let currentSongIndex = playbackStoreValue.findIndex(song => song.ID === songPlayingLocal.ID)
	let previousSongIndex = currentSongIndex - 1

	let previousSong = playbackStoreValue[previousSongIndex]

	if (previousSong === undefined && currentAudioElementLocal !== undefined) {
		currentAudioElementLocal.currentTime = 0
	}

	if (
		force === true ||
		(previousSong !== undefined && (currentAudioElementLocal === undefined || currentAudioElementLocal.currentTime <= 2))
	) {
		songToPlayUrlStore.set([previousSong.SourceFile, { playNow: true }])
	} else {
		if (currentAudioElementLocal !== undefined) {
			currentAudioElementLocal.currentTime = 0
		}
	}

	if (previousSong !== undefined) {
		if (get(isAppIdle) === true) triggerScrollToSongEvent.set(previousSong.ID)
	}
}
