<script lang="ts">
	import { onMount } from 'svelte'
	import type { SongType } from '../types/song.type'

	export let player: HTMLAudioElement
	export let currentSong: SongType

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

		playerProgress.addEventListener('mouseleave', () => (isMouseIn = false))

		playerProgress.addEventListener('mousedown', () => (isMouseDown = true))

		playerProgress.addEventListener('mouseup', () => (isMouseDown = false))

		playerProgress.addEventListener('mousemove', (evt) => {
			if (isMouseDown && isMouseIn) applyProgressChange(evt)
		})

		playerProgress.addEventListener('click', (evt) => applyProgressChange(evt))

		function applyProgressChange(evt: Event) {
			player.pause()

			playerForeground.style.transition = 'min-width 0ms linear'

			let playerWidth = playerProgress['scrollWidth']

			let selectedPercent = (100 / playerWidth) * evt['offsetX']

			document.documentElement.style.setProperty('--song-time', `${selectedPercent}%`)

			clearTimeout(pauseDebounce)

			pauseDebounce = setTimeout(() => {
				player.currentTime = currentSong['Duration'] / (100 / selectedPercent)
				playerForeground.style.transition = 'min-width 100ms linear'
				player.play()
			}, 500)
		}
	}
</script>

<player-progress>
	<progress-foreground />
	<canvas id="progress-background" />
</player-progress>

<style>
	player-progress {
		position: relative;
		width: 100%;
		height: 64px;
	}

	player-progress > * {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		height: 64px;
	}

	player-progress progress-foreground {
		z-index: 1;
		mix-blend-mode: hard-light;
		background-color: var(--hi-color);
		min-width: var(--song-time);
		transition: min-width 100ms linear;
	}

	player-progress #progress-background {
		z-index: 0;
		transition: opacity 0.3s ease-in-out;
		width: 100%;
	}
</style>
