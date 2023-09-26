import { writable, type Writable } from 'svelte/store'

// Function set in PlayerProgress
// Function called in stopSongFn
export const stopPlayerProgressFunction: Writable<Function> = writable(undefined)
