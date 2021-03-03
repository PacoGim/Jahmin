import { writable, Writable } from 'svelte/store'
import type { AlbumType } from '../types/album.type'
import type { SongType } from '../types/song.type'

export let selectedGroupByStore: Writable<string> = writable('')
export let selectedGroupByValueStore: Writable<string> = writable('')

export let albumListStore: Writable<AlbumType[]> = writable([])

// List to show within Song List component.
export let songListStore: Writable<SongType[]> = writable([])

// List to keep track of songs to play.
export let playbackStore: Writable<SongType[]> = writable([])

// Number = index of the playbackStore to play
// Boolean = Start playing right away or not.
export let playbackCursor: Writable<[number, boolean]> = writable([0, false])
