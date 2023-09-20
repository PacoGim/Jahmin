<script lang="ts">
	import { onMount } from 'svelte'
	import nextSongFn from '../../functions/nextSong.fn'

	import {
		altAudioElement,
		currentAudioElement,
		currentSongDurationStore,
		currentSongProgressStore,
		externalSongProgressChange,
		isPlaying,
		mainAudioElement,
		playingSongStore
	} from '../../stores/main.store'

	import type { PartialSongType, SongType } from '../../../../types/song.type'

	let playerProgressFillElement: HTMLElement = undefined
	let playerProgressElement: HTMLElement = undefined

	let userChangedProgress: number = undefined

	let pauseDebounce: NodeJS.Timeout = undefined

	let tempSecond = undefined

	let transitionDuration = 0
	let currentProgressWidth = 0

	$: if ($altAudioElement !== undefined && $mainAudioElement !== undefined) {
		$mainAudioElement.addEventListener('timeupdate', listenToTimeChange)
		$altAudioElement.addEventListener('timeupdate', listenToTimeChange)
	}

	$: updatePlayerProgress(userChangedProgress)

	$: calculateTransitionDuration($playingSongStore?.Duration)

	$: {
		if ($isPlaying === false) {
			pauseTransition()
		} else {
			calculateTransition($currentSongProgressStore)

			// calculateTransitionDuration($playingSongStore?.Duration)
		}
	}

	$: calculateTransition(tempSecond)

	function listenToTimeChange(evt: Event) {
		let audioElement: HTMLAudioElement = evt.target as HTMLAudioElement

		if (audioElement.paused) return

		$currentSongProgressStore = audioElement.currentTime

		let currentTimeFloor = Math.floor(audioElement.currentTime)

		if (tempSecond !== currentTimeFloor) {
			tempSecond = currentTimeFloor
		}

		// currentProgressWidth = Math.round((100 / $currentSongDurationStore) * $currentSongProgressStore || 0)
	}

	// $: console.log(transitionDuration, currentProgressWidth)

	function calculateTransition(songProgress: number) {
		let songDuration = $currentSongDurationStore
		// let currentProgressPercent = (100 / songDuration) * songProgress

		let songTimeLeft = songDuration - songProgress

		transitionDuration = songTimeLeft
	}

	function calculateTransitionDuration(songDuration: number = 0) {
		// transitionDuration = 50 * songDuration
	}

	function pauseTransition() {
		transitionDuration = 0
		currentProgressWidth = Math.round((100 / $currentSongDurationStore) * $currentSongProgressStore || 0)
	}

	function updatePlayerProgress(newValue: number) {
		if (isNaN(newValue)) return
		if ($currentAudioElement === undefined) return

		let newProgress = Math.round((100 / $currentSongDurationStore) * newValue)

		$currentAudioElement.pause()
		transitionDuration = 0
		currentProgressWidth = newProgress

		clearTimeout(pauseDebounce)
		pauseDebounce = setTimeout(() => {
			$currentAudioElement.play()
			calculateTransition($currentSongProgressStore)
			currentProgressWidth = 100
		}, 250)

		$currentAudioElement.currentTime = newValue
		$currentSongProgressStore = newValue
	}

	onMount(() => {})
</script>

<player-progress bind:this={playerProgressElement}>
	<input type="range" min="0" max={$currentSongDurationStore || 0} bind:value={userChangedProgress} />
	<player-gloss />
	<player-progress-fill style="width: {currentProgressWidth}%; transition-duration: {transitionDuration}s;" />
	<div id="waveform-data" />
</player-progress>

<style>
	player-progress {
		--player-progress-border-radius: 4px;

		display: grid;
		width: 100%;
		height: calc(100% - 1rem);
		border: 2px solid var(--art-color-base);

		border-radius: var(--player-progress-border-radius);

		cursor: grab;
		transition: border 300ms linear;
	}

	player-progress:active {
		cursor: grabbing;
	}

	player-gloss {
		grid-area: 1/1/1/1;
		pointer-events: none;

		background: linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.5) 0%,
			rgba(255, 255, 255, 0.25) 8%,
			rgba(255, 255, 255, 0) 100%
		);

		height: 100%;
		width: 100%;
		z-index: 2;
	}

	input {
		grid-area: 1/1/1/1;
		z-index: 999999;
		opacity: 0;
	}

	player-progress player-progress-fill {
		grid-area: 1/1/1/1;
		z-index: 1;
		background-color: rgba(0, 0, 0, 0.25);

		width: 0;

		transition-property: background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;

		height: 100%;

		transition: width 0ms linear;

		box-shadow: 1px 0px 5px 0px rgba(0, 0, 0, 0.25), inset -1px 0px 5px 0px rgba(0, 0, 0, 0.25);
		border-right: 2px solid #fff;
	}

	player-progress #waveform-data {
		grid-area: 1/1/1/1;
		z-index: 0;
		width: 100%;
		border-radius: var(--player-progress-border-radius);
		opacity: var(--waveform-opacity);
		transition: opacity var(--waveform-transition-duration) linear;

		pointer-events: none;
	}

	:global(player-progress #waveform-data wave) {
		border-radius: var(--player-progress-border-radius);
		height: 100% !important;
	}
</style>
