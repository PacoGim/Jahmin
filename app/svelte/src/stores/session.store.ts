import { writable, type Writable } from 'svelte/store'

//TODO Change back to appearance
export let selectedConfigOptionName: Writable<string> = writable('Appearance')
