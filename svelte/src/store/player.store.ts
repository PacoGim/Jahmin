import { Writable, writable } from 'svelte/store'

export let songToPlayUrlStore: Writable<string | undefined> = writable(undefined)

export let currentPlayerTime: Writable<number | undefined> = writable(undefined)

