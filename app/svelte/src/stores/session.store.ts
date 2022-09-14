import { writable, type Writable } from 'svelte/store'

export let selectedConfigOptionName: Writable<string> = writable('Appearance')
