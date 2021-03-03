import { Writable, writable } from 'svelte/store'
import type { AlbumType } from '../types/album.type'

import type { PlaybackType } from '../types/playback.type'
import type { playbackCursorType } from '../types/playbackCursor.type'
import type { SongType } from '../types/song.type'

// export let playbackCursor: Writable<playbackCursorType> = writable({
// 	indexToPlay: 0,
// 	playNow: false
// })

export let isPlaying: Writable<boolean> = writable(false)

export let playback: Writable<PlaybackType> = writable(undefined)

export let selectedAlbum: Writable<AlbumType> = writable(undefined)
