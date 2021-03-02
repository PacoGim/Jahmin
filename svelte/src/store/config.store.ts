import { writable, Writable } from 'svelte/store'

export let albumArtSizeConfig: Writable<string> = writable(localStorage.getItem('AlbumArtSize'))
