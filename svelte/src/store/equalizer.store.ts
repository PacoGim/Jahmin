import { writable, Writable } from 'svelte/store'
import type { EqualizerType } from '../types/equalizer.type'
import type { EqualizerProfileType } from '../types/equalizerProfile.type'

const defaultEq = {
	id: 'none',
	name: 'Loading...',
	values: []
}

export let context: Writable<AudioContext | undefined> = writable(undefined)
export let source: Writable<MediaElementAudioSourceNode | undefined> = writable(undefined)
export let equalizers: Writable<EqualizerType[]> = writable([])

export let selectedEqId: Writable<string> = writable(undefined)
export let equalizerProfiles: Writable<EqualizerProfileType[]> = writable([])

export let triggerEqualizerFrequencyValue: Writable<{ frequency: number; gain: number }> = writable(undefined)
