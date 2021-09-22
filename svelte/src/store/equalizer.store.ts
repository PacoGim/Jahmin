import { writable, Writable } from 'svelte/store'
import type { AudioFilterType } from '../types/audioFilter.type'

export let context: Writable<AudioContext | undefined> = writable(undefined)
export let source: Writable<MediaElementAudioSourceNode | undefined> = writable(undefined)
export let audioFilters: Writable<AudioFilterType[]> = writable()
