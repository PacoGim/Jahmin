<script lang="ts">
	import { onMount } from 'svelte'

	import {
		altAudioElement,
		currentAudioElement,
		currentSongDurationStore,
		currentSongProgressStore,
		isPlaying,
		mainAudioElement,
		playingSongStore
	} from '../../stores/main.store'
	import { setPlayerProgressFunction, stopPlayerProgressFunction } from '../../stores/functions.store'
	import { currentPlayerTime } from '../../stores/player.store'

	let userChangedProgress: number = undefined

	let pauseDebounce: NodeJS.Timeout = undefined

	let tempSecond = undefined

	let transitionDuration = 0
	let currentProgressWidth = 0

	let playerProgressFillElement: HTMLElement = undefined
	let inputElement: HTMLInputElement = undefined

	$: if ($altAudioElement !== undefined && $mainAudioElement !== undefined) {
		$mainAudioElement.addEventListener('timeupdate', listenToTimeChange)
		$altAudioElement.addEventListener('timeupdate', listenToTimeChange)
	}

	$: setPlayerProgress(userChangedProgress, { playNow: true })

	$: {
		if ($isPlaying === false) {
			pauseTransition()
		} else {
			playTransition()
		}
	}

	$: if ($playingSongStore) newSongProgress()

	$: window.ipc.setProgressBar((100 / $currentSongDurationStore) * $currentPlayerTime || 0)

	function newSongProgress() {
		// let newProgress = 0
		// transitionDuration = 0
		// currentProgressWidth = newProgress
		// $currentSongProgressStore = 0

		if ($isPlaying) {
			playTransition()
			setPlayerProgress(0, { playNow: true })
		} else {
			setPlayerProgress(0, { playNow: false })
		}
	}

	function listenToTimeChange(evt: Event) {
		let audioElement: HTMLAudioElement = evt.target as HTMLAudioElement

		if (audioElement.paused) return

		$currentSongProgressStore = audioElement.currentTime

		let currentTimeFloor = Math.floor(audioElement.currentTime)

		const currentWidth = playerProgressFillElement.getBoundingClientRect().width
		const maxWidth = inputElement.getBoundingClientRect().width
		const percentCompleted = Math.round((100 / maxWidth) * currentWidth)

		const currentSongProgress = Math.round((100 / $currentSongDurationStore) * $currentSongProgressStore)

		if (tempSecond !== currentTimeFloor) {
			if (currentSongProgress !== percentCompleted && currentSongProgress - 1 !== percentCompleted) {
				transitionDuration = 0
				currentProgressWidth = (100 / $currentSongDurationStore) * $currentSongProgressStore || 0

				setTimeout(() => {
					currentProgressWidth = 100
					transitionDuration = calculateTransition()
				}, 100)
			}

			tempSecond = currentTimeFloor
		}
	}

	function calculateTransition() {
		let songTimeLeft = $currentSongDurationStore - $currentSongProgressStore

		return songTimeLeft
	}

	function pauseTransition() {
		transitionDuration = 0
		currentProgressWidth = (100 / $currentSongDurationStore) * $currentSongProgressStore || 0
	}

	function playTransition() {
		pauseTransition()

		setTimeout(() => {
			currentProgressWidth = 100
			transitionDuration = calculateTransition()
		}, 100)
	}

	function stopPlayerProgress() {
		if ($currentAudioElement === undefined) return

		let newProgress = 0

		$currentAudioElement.pause()
		transitionDuration = 0
		currentProgressWidth = newProgress

		$currentAudioElement.currentTime = 0
		$currentSongProgressStore = 0
	}

	function setPlayerProgress(newValue: number, { playNow }: { playNow: boolean }) {
		if (isNaN(newValue)) return
		if ($currentAudioElement === undefined) return

		let newProgress = (100 / $currentSongDurationStore) * newValue

		$currentAudioElement.pause()
		transitionDuration = 0
		currentProgressWidth = newProgress

		if (playNow) {
			clearTimeout(pauseDebounce)
			pauseDebounce = setTimeout(() => {
				$currentAudioElement.play()

				transitionDuration = calculateTransition()
				currentProgressWidth = 100
			}, 250)
		}

		$currentAudioElement.currentTime = newValue
		$currentSongProgressStore = newValue
	}

	onMount(() => {
		stopPlayerProgressFunction.set(stopPlayerProgress)
		setPlayerProgressFunction.set(setPlayerProgress)
	})
</script>

<player-progress>
	<input bind:this={inputElement} type="range" min="0" max={$currentSongDurationStore || 0} bind:value={userChangedProgress} />
	<player-gloss />
	<player-progress-fill
		bind:this={playerProgressFillElement}
		style="width: {currentProgressWidth}%; transition-duration: {transitionDuration}s;"
	/>
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
