import { Writable, writable } from 'svelte/store'
import type { AlbumType } from '../types/album.type'
import type { SongType } from '../types/song.type'

type FilterType = {
	userSelection?: string
	filter: string
	data?: any[]
}

export let versioning: Writable<number> = writable(Date.now())

export let allSongFilters: Writable<FilterType[]> = writable([])

export let albums: Writable<AlbumType[]> = writable([])

// 'Genre', 'AlbumArtist', 'Album'
export let valuesToGroup: Writable<string[]> = writable([])

// Value choosen by the user to filter out the specified tag from the song index.
export let valuesToFilter: Writable<string[]> = writable([])
export let isValuesToFilterChanged: Writable<boolean> = writable(false)
export let storeConfig: Writable<any> = writable(undefined)

export let songList: Writable<SongType[]> = writable(undefined)

export let isDoneDrawing: Writable<boolean> = writable(false)

export let appTitle: Writable<string> = writable('Jahmin')

export let backgroundCover: Writable<any> = writable('')
