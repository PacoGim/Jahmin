import { get, writable, type Writable } from 'svelte/store'
import type { SongType } from '../../../types/song.type'
// import { isPlaying } from './player.store'

export let os: Writable<string> = writable('')
export let langFile: Writable<Object> = writable('')
export let isAppIdle: Writable<boolean> = writable(false)

// List to show within Song List component.
export let songListStore: Writable<SongType[]> = writable([])
export let selectedAlbumDir: Writable<string> = writable('')
export let selectedAlbumsDir: Writable<string[]> = writable([])
export let albumPlayingDirStore: Writable<string | undefined> = writable(undefined)
export let currentSongDurationStore: Writable<number> = writable(0)
export let currentSongProgressStore: Writable<number> = writable(0)
export let playingSongStore: Writable<SongType | SongType | undefined> = writable(undefined)

// Number = index of the playbackStore to play
// Boolean = Start playing right away or not.
export let playbackCursor: Writable<[number, boolean]> = writable([0, false])

export let triggerScrollToSongEvent: Writable<number> = writable(0)
export let triggerGroupingChangeEvent: Writable<string[]> = writable([])

// List to keep track of songs to play.
export let playbackStore: Writable<SongType[]> = writable([])

export let activeSongStore: Writable<number | undefined> = writable(undefined)
export let selectedSongsStore: Writable<number[]> = writable([])

/********************** Database **********************/
export let dbSongsStore: Writable<SongType[]> = writable([])
export let dbVersionStore: Writable<number | undefined> = writable(0)

/********************** Keyboard/Mouse Events **********************/
export let keyPressed: Writable<string | undefined> = writable(undefined)
export let keyModifier: Writable<'altKey' | 'ctrlKey' | 'shiftKey' | undefined> = writable(undefined)
export let mousePosition: Writable<{ x: number; y: number } | undefined> = writable(undefined)
export let isMouseDown: Writable<boolean> = writable(false)

/********************** Playback **********************/

export let appTitle: Writable<string> = writable('Jahmin')

export let elementMap: Writable<Map<string, HTMLElement> | undefined> = writable(new Map<string, HTMLElement>())

export let windowResize: Writable<number> = writable(0)

/********************** ConfigLayout **********************/
export let layoutToShow: Writable<'Library' | 'Playback' | 'Config' | 'Lyrics' | 'Playlist'> = writable('Library')
export let configOptionSelected: Writable<'Appearance' | 'Equalizer' | 'Library' | 'Song List Tags'> = writable('Appearance')

/********************** Song search  **********************/
export let userSearch: Writable<string> = writable('')

/********************** Song Group **********************/
export let selectedGroups: Writable<any> = writable([])

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

export let songLyricsSelected: Writable<{ title: string; artist: string } | undefined> = writable(undefined)

export function setSelectedAlbumsDir(newSelectedAlbumsDir: string[] | undefined) {
	if (newSelectedAlbumsDir === undefined) return

	if (newSelectedAlbumsDir.toString() !== get(selectedAlbumsDir).toString()) {
		selectedAlbumsDir.set(newSelectedAlbumsDir)
	}
}

layoutToShow.subscribe(layoutName => {
	document.title = layoutName ? `Jahmin ${layoutName}` : 'Jahmin'
})

// playingSongStore.subscribe(song => {
// 	if (song) {
// 		window.ipc.setPlayerInfo(song?.Title || '', song?.Artist || '', get(isPlaying))
// 	}
// })

// isPlaying.subscribe(isPlayingValue => {
// 	let songTitle = get(playingSongStore)?.Title || ''
// 	let songArtist = get(playingSongStore)?.Artist || ''

// 	window.ipc.setPlayerInfo(songTitle, songArtist, isPlayingValue)
// })
