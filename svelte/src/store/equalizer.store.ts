import { writable, Writable } from 'svelte/store'
import type { AudioFilterType } from '../types/audioFilter.type'
import type { EqualizerType } from '../types/equalizer.type'

const defaultEq = {
	id: 'none',
	name: 'Loading...',
	values: []
}

export let context: Writable<AudioContext | undefined> = writable(undefined)
export let source: Writable<MediaElementAudioSourceNode | undefined> = writable(undefined)
export let selectedEq: Writable<EqualizerType> = writable(defaultEq)
export let equalizers: Writable<EqualizerType[]> = writable([])
