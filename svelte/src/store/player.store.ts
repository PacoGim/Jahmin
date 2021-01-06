import { Writable, writable } from 'svelte/store'

export let songIndex: Writable<number> = writable(null)
export let playing: Writable<boolean> = writable(false)
