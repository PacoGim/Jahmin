import { writable, Writable } from 'svelte/store'
import type { EqualizerType } from '../types/equalizer.type'
import type { EqualizerProfileType } from '../types/equalizerProfile.type'

export let context: Writable<AudioContext | undefined> = writable(undefined)
export let source: Writable<MediaElementAudioSourceNode | undefined> = writable(undefined)
export let equalizers: Writable<EqualizerType[]> = writable([])
export let equalizer: Writable<EqualizerType> = writable({})

export let selectedEqId: Writable<string> = writable(undefined)
export let equalizerProfiles: Writable<EqualizerProfileType[]> = writable([])
