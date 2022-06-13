import { writable, type Writable } from 'svelte/store'

export let equalizerService: Writable<any> = writable(undefined)
export let confirmService: Writable<any> = writable(undefined)
export let promptService: Writable<any> = writable(undefined)
export let rangeInputService: Writable<any> = writable(undefined)
export let storageService: Writable<any> = writable(undefined)
