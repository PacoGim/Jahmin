import { writable, type Writable } from 'svelte/store'

//TODO Change back to appearance
export let selectedConfigOptionName: Writable<'Appearance' | 'Equalizer' | 'Library' | 'Song List Tags'> =
	writable('Library')
