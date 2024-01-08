import { get, writable, type Writable } from 'svelte/store'
import { context, sourceAltAudio, sourceMainAudio } from './equalizer.store'
import EqualizerService from '../services/equalizer/!equalizer.service'
import { playingSongStore } from './main.store'

export let songToPlayUrlStore: Writable<[string | undefined, { playNow: boolean }]> = writable([undefined, { playNow: false }])

export let currentPlayerTime: Writable<number | undefined> = writable(undefined)

export let mainAudioPlayer: Writable<HTMLAudioElement> = writable()
export let altAudioPlayer: Writable<HTMLAudioElement> = writable()

let playerUpdated = writable(0)

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

export let audioPlayerStates: Writable<{
	[key: string]: AudioPlayerStateType
	main: AudioPlayerStateType
	alt: AudioPlayerStateType
}> = writable({
	main: get(mainAudioPlayerState),
	alt: get(altAudioPlayerState)
})

export let currentAudioPlayer: Writable<HTMLAudioElement | undefined> = writable(undefined)
export let currentAudioPlayerName: Writable<'main' | 'alt'> = writable()

// Allows to share with the rest of the app whether the player is playing or not.
export let isPlaying: Writable<boolean> = writable(false)

mainAudioPlayerState.subscribe(value => {
	get(audioPlayerStates).main = value

	if (value.isPlaying === false && get(altAudioPlayerState).isPlaying === false) {
		isPlaying.set(false)
	} else if (value.isPlaying === true) {
		isPlaying.set(true)
	}
})

altAudioPlayerState.subscribe(value => {
	get(audioPlayerStates).alt = value

	if (value.isPlaying === false && get(mainAudioPlayerState).isPlaying === false) {
		isPlaying.set(false)
	} else if (value.isPlaying === true) {
		isPlaying.set(true)
	}
})

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
		areBothPlayersReady()
		mainAudioPlayerUnsubscribe()
	}
})

let altAudioPlayerUnsubscribe = altAudioPlayer.subscribe(value => {
	if (value !== undefined) {
		areBothPlayersReady()
		altAudioPlayerUnsubscribe()
	}
})

function areBothPlayersReady() {
	if (get(mainAudioPlayer) !== undefined && get(altAudioPlayer) !== undefined) {
		if (get(context) === undefined) {
			// $context = new window.AudioContext()
			context.set(new window.AudioContext())

			// Source for the main audio element.
			sourceMainAudio.set(get(context)!.createMediaElementSource(get(mainAudioPlayer)))
			// $sourceMainAudio = $context.createMediaElementSource($mainAudioElement)

			// Source for the alt audio element.
			sourceAltAudio.set(get(context)!.createMediaElementSource(get(altAudioPlayer)))
			// $sourceAltAudio = $context.createMediaElementSource($altAudioElement)

			EqualizerService.initEqualizerFn()
		}
	}
}

type AudioPlayerStateType = {
	isPlaying: boolean
	isPreloaded: boolean
	isPreloading: boolean
}
