import { writable, Writable } from 'svelte/store'
import type { AudioFilterType } from '../types/audioFilter.type'
import type { EqualizerType } from '../types/equalizer.type'

export let context: Writable<AudioContext | undefined> = writable(undefined)
export let source: Writable<MediaElementAudioSourceNode | undefined> = writable(undefined)
export let selectedEq: Writable<AudioFilterType[]> = writable([])
export let equalizers: Writable<EqualizerType[]> = writable([])
