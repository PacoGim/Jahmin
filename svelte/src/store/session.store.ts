import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

export let selectedConfigOptionName: Writable<string> = writable('Song List Tags')
