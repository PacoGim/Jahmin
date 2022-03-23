<script lang="ts">
	import { onMount } from 'svelte'
	import { setWaveSource } from '../services/waveform.service'
	import { context, sourceAltAudio, sourceMainAudio } from '../store/equalizer.store'

	// Store
	import {
		currentAudioElement,
		albumPlayingIdStore,
		mainAudioElement,
		altAudioElement,
		playbackStore,
		playingSongStore
	} from '../store/final.store'
	import { currentPlayerTime, songToPlayUrlStore } from '../store/player.store'
	import type { SongType } from '../types/song.type'

	// let currentAudioElement: HTMLAudioElement

	// Time when the next song will start playing before the end of the playing song.
	// Makes songs audio overlap at the end to get a nice smooth transition between songs.
	// Default is 250ms -> (250ms / 1000ms = 0.25s).
	const smoothTimeMs = 250 / 1000

	let audioElements = {
		main: {
			domElement: undefined,
			isPlaying: false,
			isPreloaded: false
		},
		alt: {
			domElement: undefined,
			isPlaying: false,
			isPreloaded: false
		}
	}

	$: {
		if ($mainAudioElement !== undefined && $context === undefined) {
			$context = new window.AudioContext()

			// Source for the main audio element.
			$sourceMainAudio = $context.createMediaElementSource($mainAudioElement)

			// Source for the alt audio element.
			$sourceAltAudio = $context.createMediaElementSource($altAudioElement)
		}
	}

	$: playSong($songToPlayUrlStore)

	// Functions
	function playSong(songUrl: string | undefined) {
		if (songUrl) {
			$songToPlayUrlStore = undefined

			updateCurrentSongData($playbackStore.find(song => song.SourceFile === songUrl))

			setCurrentAudioElement($mainAudioElement)

			// Sets the new song to play.
			$mainAudioElement.src = songUrl

			// Stops the next audio element from playing.
			$altAudioElement.src = ''

			// Starts playing the song.
			$mainAudioElement.play()

			audioElements.main.isPlaying = true
			audioElements.main.isPreloaded = true
			audioElements.alt.isPlaying = false
			audioElements.alt.isPreloaded = false
		}
	}

	function updateCurrentSongData(song: SongType) {
		$playingSongStore = song
		setWaveSource(song.SourceFile, $albumPlayingIdStore, song.Duration)
	}

	function setCurrentAudioElement(audioElement: HTMLAudioElement) {
		$currentAudioElement = audioElement
		$currentAudioElement.addEventListener('timeupdate', handleTimeUpdate)
	}

	function handleTimeUpdate() {
		// Alt audio name refers to the current alternative player.
		// If the main audio player is the current one then, the alt audio player is the next one.
		// If the alt audio player is the current one then, the main audio player is the next one.
		let altAudioName = this.id === 'main' ? 'alt' : 'main'

		const currentTime /* in seconds */ = this.currentTime
		const duration /* in seconds */ = this.duration

		// Update time only if the current audio element is playing.
		if (audioElements[this.id].isPlaying === true) {
			$currentPlayerTime = currentTime
		}

		// If the current time is greater than one second, then the next audio element is preloaded.
		if (currentTime > 1 && audioElements[altAudioName].isPreloaded === false) {
			audioElements[altAudioName].isPreloaded = true
			audioElements[this.id].isPreloaded = false

			// Gets the current song index.
			let currentSongIndex = $playbackStore.findIndex(song => song.SourceFile === this.getAttribute('src'))

			// Gets the next song based of the current song index.
			let nextSong = $playbackStore[currentSongIndex + 1]

			audioElements[altAudioName].domElement.src = nextSong.SourceFile

			//TODO: Check if song does not exist.
		}

		// If the current alt audio element is not yet playing and the current time is greater than the duration minus the smooth time, then the next song is played.
		if (audioElements[altAudioName].isPlaying === false && currentTime >= duration - smoothTimeMs) {
			audioElements[altAudioName].isPlaying = true
			audioElements[this.id].isPlaying = false
			audioElements[altAudioName].domElement.play()

			updateCurrentSongData(
				$playbackStore.find(song => song.SourceFile === audioElements[altAudioName].domElement.getAttribute('src'))
			)

			setCurrentAudioElement(audioElements[altAudioName].domElement)
		}
	}

	onMount(() => {
		$mainAudioElement = document.querySelector('audio#main')
		$altAudioElement = document.querySelector('audio#alt')

		audioElements.main.domElement = $mainAudioElement
		audioElements.alt.domElement = $altAudioElement
	})
</script>

<audio id="main">
	<track kind="captions" />
</audio>

<audio id="alt">
	<track kind="captions" />
</audio>

<style>
	audio {
		display: none;
		position: fixed;
	}
</style>
