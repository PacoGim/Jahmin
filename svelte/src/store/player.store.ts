import { Writable, writable } from 'svelte/store'

import type { PlaylistType } from "../types/playlist.type"
import type { TagType } from '../types/tag.type'

export let playlistIndex: Writable<number> = writable(undefined)
export let isPlaying: Writable<boolean> = writable(false)
export let playlist: Writable<PlaylistType> = writable(undefined)
export let selectedAlbum: Writable<any> = writable(undefined)

