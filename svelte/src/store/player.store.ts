import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

export let songToPlayUrlStore: Writable<[string | undefined, { playNow: boolean }]> = writable([undefined, { playNow: false }])

export let currentPlayerTime: Writable<number | undefined> = writable(undefined)
