import { type Writable, writable } from 'svelte/store'

export let onNewLyrics: Writable<{ title: string; artist: string } | null> = writable(null)
