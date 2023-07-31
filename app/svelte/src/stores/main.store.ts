import { writable, type Writable } from 'svelte/store'
import type { PartialSongType, SongType } from '../../../types/song.type'

export let os: Writable<string> = writable(undefined)
export let langFile: Writable<Object> = writable(undefined)
export let isAppIdle: Writable<boolean> = writable(false)

// List to show within Song List component.
export let songListStore: Writable<SongType[]> = writable(undefined)
export let selectedAlbumDir: Writable<string | undefined> = writable(undefined)
export let selectedAlbumsDir: Writable<string[] | undefined> = writable([])
export let albumPlayingDirStore: Writable<string | undefined> = writable(undefined)
export let currentSongDurationStore: Writable<number> = writable(0)
export let currentSongProgressStore: Writable<number> = writable(0)
export let externalSongProgressChange: Writable<number> = writable(undefined)
export let playingSongStore: Writable<PartialSongType | SongType | undefined> = writable(undefined)

// Number = index of the playbackStore to play
// Boolean = Start playing right away or not.
export let playbackCursor: Writable<[number, boolean]> = writable([0, false])

export let triggerScrollToSongEvent: Writable<number> = writable(0)
export let triggerGroupingChangeEvent: Writable<string[]> = writable([])

export let isSongShuffleEnabledStore: Writable<boolean> = writable(false)
export let isSongRepeatEnabledStore: Writable<boolean> = writable(false)
export let isPlaybackRepeatEnabledStore: Writable<boolean> = writable(false)

// List to keep track of songs to play.
export let playbackStore: Writable<SongType[]> = writable([])

export let activeSongStore: Writable<number | undefined> = writable(undefined)
export let selectedSongsStore: Writable<number[]> = writable([])

/********************** Database **********************/
export let dbSongsStore: Writable<SongType[]> = writable([])
export let dbVersionStore: Writable<number | undefined> = writable(0)

/********************** Keyboard Events **********************/
export let keyPressed: Writable<string | undefined> = writable(undefined)
export let keyModifier: Writable<'altKey' | 'ctrlKey' | 'shiftKey' | undefined> = writable(undefined)

export let appTitle: Writable<string> = writable('Jahmin')

export let elementMap: Writable<Map<string, HTMLElement> | undefined> = writable(new Map<string, HTMLElement>())

export let windowResize: Writable<number> = writable(undefined)

/********************** ConfigLayout **********************/
export let layoutToShow: Writable<'Library' | 'Playback' | 'Config' | 'Lyrics'> = writable('Library')
export let configOptionSelected: Writable<'Appearance' | 'Equalizer' | 'Library' | 'Song List Tags'> = writable('Appearance')

export let mainAudioElement: Writable<HTMLAudioElement | undefined> = writable(undefined)
export let altAudioElement: Writable<HTMLAudioElement | undefined> = writable(undefined)
export let currentAudioElement: Writable<HTMLAudioElement | undefined> = writable(undefined)

/********************** Song Group **********************/
export let selectedGroups: Writable<any> = writable([])

// Allows to share with the rest of the app whether the player is playing or not.
export let isPlaying: Writable<boolean> = writable(false)

export let albumArtMapStore: Writable<
	Map<
		string | number,
		{
			artSize: string
			artPath: string
			artType: string
		}[]
	>
> = writable(new Map<string, []>())

/********************** Queue Progress **********************/
export let artCompressQueueLength: Writable<number> = writable(0)

export let songSyncQueueProgress: Writable<{
	isSongUpdating: boolean
	maxLength: number
	currentLength: number
}> = writable({
	isSongUpdating: false,
	maxLength: 0,
	currentLength: 0
})

export let songListItemElement: Writable<HTMLElement | undefined> = writable(undefined)

export let reloadArts: Writable<number> = writable(Math.random())

export let songLyricsSelected: Writable<{ title: string; artist: string }> = writable(undefined)

layoutToShow.subscribe(layoutName => {
	document.title = layoutName ? `Jahmin · ${layoutName}` : 'Jahmin'
})

