import { writable, Writable } from 'svelte/store'
import type { AlbumType } from '../types/album.type'
import type { AlbumArtType } from '../types/albumArt.type'
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

export let albumArtMapStore: Writable<Map<string | number, AlbumArtType>> = writable(new Map<string, AlbumArtType>())

export let appTitle: Writable<string> = writable('Jahmin')

export let dbVersion: Writable<string> = writable('')

export let updateSongProgress: Writable<number> = writable(-1)

export let elementMap: Writable<Map<string, HTMLElement>> = writable(undefined)

// PlayerController.svelte -> Grouping.svelte
export let triggerGroupingChangeEvent: Writable<string[]> = writable([])

// PlayerController.svelte -> SongList.svelte
export let triggerScrollToSongEvent: Writable<number> = writable(0)

/********************** ConfigLayout **********************/
export let layoutToShow: Writable<'Home' | 'Search' | 'Config'> = writable('Home')
export let selectedOption: Writable<
	'Appearance' | 'Library' | 'Groups' | 'Equalizer' | 'Art Grid' | 'Song List' | 'Song Info' | 'Volume' | string
> = writable('Library')
export let selectedOptionSection: Writable<string> = writable('')

export let mainAudioElement: Writable<HTMLAudioElement> = writable(undefined)
export let altAudioElement: Writable<HTMLAudioElement> = writable(undefined)
export let currentAudioElement: Writable<HTMLAudioElement> = writable(undefined)

/********************** Keyboard Events **********************/
export let keyUp: Writable<string> = writable(undefined)
export let keyDown: Writable<string> = writable(undefined)

export let songListItemElement: Writable<HTMLElement> = writable(undefined)

/********************** Song Group **********************/
export let selectedGroups: Writable<any> = writable([])

export let isAppIdle: Writable<boolean> = writable(false)

/********************** Queue Progress **********************/
export let artCompressQueueProgress: Writable<{ maxLength: number; currentLength: number }> = writable({
	maxLength: 0,
	currentLength: 0
})
