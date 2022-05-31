import { Writable, writable } from 'svelte/store'

export let selectedConfigOptionName: Writable<string> = writable('Equalizer')
