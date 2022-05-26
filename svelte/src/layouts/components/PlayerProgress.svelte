<script lang="ts">
	import { onMount } from 'svelte'
	import nextSongFn from '../../functions/nextSong.fn'

	import {
		currentAudioElement,
		currentSongDurationStore,
		currentSongProgressStore,
		isPlaying,
		playingSongStore
	} from '../../store/final.store'
	import type { SongType } from '../../types/song.type'

	let pauseDebounce: NodeJS.Timeout = undefined
	let playerProgressFillElement: HTMLElement = undefined
	let playerProgressElement: HTMLElement = undefined

	let isMouseDown = false
	let isMouseIn = false

	$: {
		if (playerProgressFillElement !== undefined) {
			if ($isPlaying) {
				resumeProgress()
			} else {
				stopProgress()
			}
		}
	}

	$: {
		if ($playingSongStore !== undefined) {
			setProgressFromNewSong($playingSongStore)
		}
	}

	function hookPlayerProgressEvents() {
		playerProgressElement.addEventListener('mouseenter', () => (isMouseIn = true))

		playerProgressElement.addEventListener('mouseleave', () => {
			isMouseIn = false

			// Resets also mouse down if the user leaves the area while holding the mouse down then comes back with mouse up the event would still trigger.
			isMouseDown = false
		})

		playerProgressElement.addEventListener('mousedown', () => (isMouseDown = true))

		playerProgressElement.addEventListener('mouseup', () => (isMouseDown = false))

		playerProgressElement.addEventListener('mousemove', evt => {
			if (isMouseDown && isMouseIn) applyProgressChange(evt as MouseEvent)
		})

		playerProgressElement.addEventListener('click', evt => applyProgressChange(evt as MouseEvent))
	}

	function applyProgressChange(evt: MouseEvent) {
		if ($playingSongStore === undefined) return

		$currentAudioElement.pause()

		let playerProgressElementWidth = playerProgressElement.scrollWidth
		let selectedPercent = Math.floor((100 / playerProgressElementWidth) * evt.offsetX)

		if (selectedPercent <= 0) selectedPercent = 0

		if (selectedPercent >= 100) selectedPercent = 100

		let songPercentTimeInSeconds = $currentSongDurationStore / (100 / selectedPercent) || 0

		$currentSongProgressStore = songPercentTimeInSeconds

		setProgress(songPercentTimeInSeconds, $playingSongStore.Duration)

		clearTimeout(pauseDebounce)

		pauseDebounce = setTimeout(() => {
			$currentAudioElement.currentTime = songPercentTimeInSeconds

			$currentAudioElement.play().catch(err => {})
		}, 500)
	}

	function resumeProgress() {
		playerProgressFillElement.style.animationPlayState = 'running'
	}

	function stopProgress() {
		playerProgressFillElement.style.animationPlayState = 'paused'
	}

	function setProgress(songProgress: number | undefined, songDuration: number | undefined) {
		if (songDuration - songProgress <= 0.5) {
			nextSongFn()
			return
		}

		playerProgressFillElement.style.animationName = 'reset-fill-progress'

		setTimeout(() => {
			let songProgressInPercent = 100 / (songDuration / (songProgress + 0.2))
			let timeLeft = Math.round(songDuration - (songProgress + 0.2))
			playerProgressFillElement.style.minWidth = `${songProgressInPercent}%`
			playerProgressFillElement.style.animationDuration = `${timeLeft}s`
			playerProgressFillElement.style.animationName = 'fill-progress'
			resumeProgress()
		}, 100)
	}

	function setProgressFromNewSong(song: SongType) {
		playerProgressFillElement.style.animationDuration = `0ms`
		playerProgressFillElement.style.animationName = 'reset-fill-progress'
		setProgress(0, song.Duration)
	}

	onMount(() => {
		playerProgressFillElement = document.querySelector('player-progress player-progress-fill')
		playerProgressElement = document.querySelector('player-progress')
		hookPlayerProgressEvents()
	})
</script>

<player-progress>
	<player-gloss />
	<player-progress-fill />
	<div id="waveform-data" />
</player-progress>

<style>
	player-progress {
		--player-progress-border-radius: 4px;

		display: grid;
		width: 100%;
		margin: 0 1rem;
		height: calc(100% - 1rem);
		border: 2px solid var(--base-color);

		border-radius: var(--player-progress-border-radius);

		transition: border 300ms linear;
	}

	player-progress:active {
		cursor: grabbing;
	}

	player-progress {
		cursor: grab;
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

	player-progress player-progress-fill {
		grid-area: 1/1/1/1;
		z-index: 1;
		background-color: rgba(0, 0, 0, 0.1);

		width: 0;
		/* min-width: var(--song-time); */

		transition-property: background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;

		animation-name: fill-progress;
		animation-timing-function: linear;
		animation-play-state: paused;
		animation-fill-mode: forwards;

		height: 100%;

		box-shadow: 1px 0px 5px 0px rgba(0, 0, 0, 0.25), inset -1px 0px 5px 0px rgba(0, 0, 0, 0.25);
		border-right: 2px solid #fff;
	}

	@keyframes -global-fill-progress {
		to {
			min-width: 100%;
		}
	}

	@keyframes -global-reset-fill-progress {
		to {
			min-width: 0%;
		}
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
