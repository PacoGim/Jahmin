import {
	currentAudioElement,
	currentSongProgressStore,
	isPlaying,
	playbackStore,
	playingSongStore,
	triggerScrollToSongEvent
} from '../stores/main.store'
import { songToPlayUrlStore } from '../stores/player.store'
import type { SongType } from '../../../types/song.type'
import setNewPlaybackFn from './setNewPlayback.fn'
import getDirectoryFn from './getDirectory.fn'

let currentAudioElementLocal: HTMLAudioElement = undefined

let currentAudioElementSubscription = currentAudioElement.subscribe(value => {
	if (value !== undefined) {
		currentAudioElementLocal = value

		currentAudioElementSubscription()
	}
})

export default function () {
	// let playbackStoreValue: SongType[]
	// playbackStore.subscribe(value => (playbackStoreValue = value))()

	// let song = playbackStoreValue[0]

	// setNewPlaybackFn(getDirectoryFn(song.SourceFile), playbackStoreValue, song.ID, { playNow: false })

	// playingSongStore.set(undefined)
	// currentAudioElementLocal.pause()
	// currentAudioElementLocal.currentTime = 0
	// currentSongProgressStore.set(0)
	// songToPlayUrlStore.set(['Stop Playing', { playNow: false }])

	// let song = playbackStoreValue[0]

	// if (song) {
	// 	songToPlayUrlStore.set([playbackStoreValue[0].SourceFile, { playNow: false }])
	// } else {
	//   console.log()
	// }
}
