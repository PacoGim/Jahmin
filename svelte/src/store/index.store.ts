import { Writable, writable } from 'svelte/store'

export let songIndex:Writable<string[]> = writable([])
