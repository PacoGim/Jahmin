import { Writable, writable } from 'svelte/store'

import type { PlaybackType } from '../types/playback.type'
import type { PlaybackIndexType } from '../types/playbackIndex.type'

export let playbackIndex: Writable<PlaybackIndexType> = writable({
	indexToPlay: 0,
	playNow: false
})

export let isPlaying: Writable<boolean> = writable(false)

export let playback: Writable<PlaybackType> = writable(undefined)

export let selectedAlbum: Writable<any> = writable(undefined)
