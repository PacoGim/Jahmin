import { get, writable, type Writable } from 'svelte/store'

export let songToPlayUrlStore: Writable<[string | undefined, { playNow: boolean }]> = writable([undefined, { playNow: false }])

export let currentPlayerTime: Writable<number | undefined> = writable(undefined)

export let mainAudioPlayer: Writable<HTMLAudioElement> = writable()
export let altAudioPlayer: Writable<HTMLAudioElement> = writable()

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

export let audioPlayerStates: {
	[key: string]: AudioPlayerStateType
	main: AudioPlayerStateType
	alt: AudioPlayerStateType
} = {
	main: get(mainAudioPlayerState),
	alt: get(altAudioPlayerState)
}

export let currentAudioPlayer: Writable<HTMLAudioElement | undefined> = writable(undefined)
export let currentAudioPlayerName: Writable<'main' | 'alt'> = writable()

// Listens to a name change. When the name changes, the current player is set to either main or alt player
currentAudioPlayerName.subscribe(value => {
	if (value === 'main') {
		currentAudioPlayer.set(get(mainAudioPlayer))
	} else if (value === 'alt') {
		currentAudioPlayer.set(get(altAudioPlayer))
	}
})

// When the app first starts up, the main player is set to the current player
let mainAudioPlayerUnsubscribe = mainAudioPlayer.subscribe(value => {
	if (value !== undefined) {
		currentAudioPlayerName.set('main')
		mainAudioPlayerUnsubscribe()
	}
})

type AudioPlayerStateType = {
	isPlaying: boolean
	isPreloaded: boolean
	isPreloading: boolean
}
