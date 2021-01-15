import { writable, Writable } from 'svelte/store'

export let lastAlbumPlayed: Writable<string> = writable(undefined)
export let lastSongIndexPlayed: Writable<number> = writable(undefined)
