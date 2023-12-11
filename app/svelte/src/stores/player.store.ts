import { writable, type Writable } from 'svelte/store'

export let songToPlayUrlStore: Writable<[string | undefined, { playNow: boolean }]> = writable([undefined, { playNow: false }])

export let currentPlayerTime: Writable<number | undefined> = writable(undefined)

export let mainAudioPlayer: Writable<HTMLAudioElement | undefined> = writable(undefined)
export let altAudioPlayer: Writable<HTMLAudioElement | undefined> = writable(undefined)

export let mainAudioPlayerState: Writable<AudioPlayerStateType> = writable({
	isPlaying: false,
	isPreloaded: false,
	isPreloading: false
})

export let altAudioPlayerState: Writable<AudioPlayerStateType> = writable({
	isPlaying: false,
	isPreloaded: false,
	isPreloading: false
})

export let currentAudioPlayer: Writable<HTMLAudioElement | undefined> = writable(undefined)

type AudioPlayerStateType = {
	isPlaying: boolean
	isPreloaded: boolean
	isPreloading: boolean
}
