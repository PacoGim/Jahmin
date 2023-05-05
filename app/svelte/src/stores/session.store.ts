import { writable, type Writable } from 'svelte/store'

export let selectedConfigOptionName: Writable<'Appearance' | 'Equalizer' | 'Library' | 'Song List Tags'> = writable('Equalizer')
