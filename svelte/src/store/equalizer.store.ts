import { writable, type Writable } from 'svelte/store'
import type { EqualizerType } from '../types/equalizer.type'
import type { EqualizerProfileType } from '../types/equalizerProfile.type'

export let context: Writable<AudioContext | undefined> = writable(undefined)
export let sourceAltAudio: Writable<MediaElementAudioSourceNode | undefined> = writable(undefined)
export let sourceMainAudio: Writable<MediaElementAudioSourceNode | undefined> = writable(undefined)
export let equalizers: Writable<EqualizerType[]> = writable([])

export let equalizer: Writable<EqualizerType> = writable({})

export let selectedEqName: Writable<string> = writable(undefined)
export let equalizerProfiles: Writable<EqualizerProfileType[]> = writable([])
export let equalizerNameStore: Writable<string> = writable('')

export let isEqualizerOn: Writable<boolean> = writable(true)
export let isEqualizerDirty: Writable<boolean> = writable(false)
