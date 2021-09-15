import { writable, Writable } from 'svelte/store'
import type { AlbumType } from '../types/album.type'
import type { CoverArtType } from '../types/coverArt.type'
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

// Id of the current album playing.
export let albumPlayingIdStore: Writable<string> = writable(undefined)

export let songPlayingIdStore: Writable<number> = writable(undefined)

// Allows to share with the rest of the app whether the player is playing or not.
export let isPlaying: Writable<boolean> = writable(false)

export let playingSongStore: Writable<SongType> = writable(undefined)

export let selectedAlbumId: Writable<string> = writable(undefined)

export let selectedSongsStore: Writable<number[]> = writable([])

export let albumCoverArtMapStore: Writable<Map<string | number, CoverArtType>> = writable(new Map<string, CoverArtType>())

export let appTitle: Writable<string> = writable('Jahmin')

export let dbVersion: Writable<number> = writable(0)

export let updateSongProgress: Writable<number> = writable(-1)

export let elementMap: Writable<Map<string, HTMLElement>> = writable(undefined)

// PlayerController.svelte -> Grouping.svelte
export let triggerGroupingChangeEvent: Writable<string> = writable('')

// PlayerController.svelte -> SongList.svelte
export let triggerScrollToSongEvent: Writable<number> = writable(0)

/********************** ConfigLayout **********************/
export let layoutToShow:Writable<'Main'|'Search'|'Config'> = writable('Main')
