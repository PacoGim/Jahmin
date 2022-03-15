<script lang="ts">
	import { onMount } from 'svelte'
	import { setWaveSource } from '../services/waveform.service'

	// Store
	import {
		albumPlayingIdStore,
		mainAudioElement,
		nextAudioElement,
		playbackStore,
		playingSongStore
	} from '../store/final.store'
	import { currentPlayerTime, songToPlayUrlStore } from '../store/player.store'
	import type { SongType } from '../types/song.type'

	let currentAudioElement: HTMLAudioElement

	$: playSong($songToPlayUrlStore)

	// Functions
	function playSong(songUrl: string | undefined) {
		if (songUrl) {
			updateCurrentSongData($playbackStore.find(song => song.SourceFile === songUrl))

			setCurrentAudioElement($mainAudioElement)

			// Stops the next audio element from playing.
			$nextAudioElement.src = ''

			// Sets the new song to play.
			$mainAudioElement.src = songUrl

			// Starts playing the song.
			$mainAudioElement.play()
		}
	}

	function updateCurrentSongData(song: SongType) {
		$playingSongStore = song
		setWaveSource(song.SourceFile, $albumPlayingIdStore, song.Duration)
	}

	function setCurrentAudioElement(audioElement: HTMLAudioElement) {
		currentAudioElement = audioElement
		currentAudioElement.addEventListener('timeupdate', handleTimeUpdate)
	}

	function handleTimeUpdate() {
		let audioElementId = this.id

		$currentPlayerTime = this.currentTime
	}

	onMount(() => {
		$mainAudioElement = document.querySelector('audio#main')
		$nextAudioElement = document.querySelector('audio#next')
	})
</script>

<audio id="main">
	<!--  on:timeupdate={() => mainAudioTimeUpdate()} on:pause={() => checkIfPlaying()} on:play={() => checkIfPlaying()} -->
	<track kind="captions" />
</audio>

<audio id="next">
	<!-- on:timeupdate={() => nextAudioTimeUpdate()} on:pause={() => checkIfPlaying()} on:play={() => checkIfPlaying()} -->
	<track kind="captions" />
</audio>

<style>
	audio {
		display: none;
		position: fixed;
	}
</style>
