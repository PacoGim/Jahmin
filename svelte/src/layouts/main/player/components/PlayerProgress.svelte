<script lang="ts">
	import { onMount } from 'svelte'

	import { playerElement, updateSongProgress } from '../../../../store/final.store'

	import type { SongType } from '../../../../types/song.type'

	export let song: SongType

	let pauseDebounce: NodeJS.Timeout = undefined

	let isMouseDown = false
	let isMouseIn = false

	onMount(() => {
		hookPlayerProgressEvents()
	})

	function hookPlayerProgressEvents() {
		let playerProgress = document.querySelector('player-progress')
		let playerForeground: HTMLElement = document.querySelector('player-progress progress-foreground')

		playerProgress.addEventListener('mouseenter', () => (isMouseIn = true))

		playerProgress.addEventListener('mouseleave', () => {
			isMouseIn = false

			// Resets also mouse down if the user leaves the area while holding the mouse down then comes back with mouse up the event would still trigger.
			isMouseDown = false
		})

		playerProgress.addEventListener('mousedown', () => (isMouseDown = true))

		playerProgress.addEventListener('mouseup', () => (isMouseDown = false))

		playerProgress.addEventListener('mousemove', evt => {
			if (isMouseDown && isMouseIn) applyProgressChange(evt)
		})

		playerProgress.addEventListener('click', evt => applyProgressChange(evt))

		function applyProgressChange(evt: Event) {
			if (song === undefined) return

			$playerElement.pause()

			playerForeground.classList.add('not-smooth')

			let playerWidth = playerProgress.scrollWidth

			//@ts-expect-error
			let selectedPercent = Math.ceil((100 / playerWidth) * evt.offsetX)

			let songPercentTime = song.Duration / (100 / selectedPercent)

			// Allows for the player component to get the new value and update the song duration.
			$updateSongProgress = songPercentTime

			document.documentElement.style.setProperty('--song-time', `${selectedPercent}%`)

			clearTimeout(pauseDebounce)

			pauseDebounce = setTimeout(() => {
				$playerElement.currentTime = songPercentTime
				playerForeground.classList.remove('not-smooth')
				$playerElement.play()
			}, 500)
		}
	}
</script>

<player-progress>
	<player-gloss />
	<progress-foreground />
	<div id="waveform-data" />
</player-progress>

<style>
	player-progress {
		--player-progress-border-radius: 4px;

		cursor: grab;

		display: grid;
		width: 100%;
		margin: 1rem;
		height: calc(100% - 1rem);
		/* border: 2px solid white; */
		border: 2px solid var(--base-color);

		border-radius: var(--player-progress-border-radius);

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

	player-progress progress-foreground {
		grid-area: 1/1/1/1;
		z-index: 1;
		background-color: rgba(0, 0, 0, 0.1);

		width: 0;
		min-width: var(--song-time);

		transition-property: min-width, background-color;
		transition-duration: 100ms, 300ms;
		transition-timing-function: linear;
		height: 100%;

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
	}

	:global(player-progress #waveform-data wave) {
		border-radius: var(--player-progress-border-radius);
		height: 100% !important;
	}
</style>
