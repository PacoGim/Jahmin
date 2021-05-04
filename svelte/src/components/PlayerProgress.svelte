<script lang="ts">
	import { onMount } from 'svelte'
	import { getWaveformIPC } from '../service/ipc.service'
	import { playbackCursor, playbackStore } from '../store/final.store'
	import type { SongType } from '../types/song.type'
	import { createWaveFormElement, setWaveSource } from '../service/waveform.service'

	export let player: HTMLAudioElement
	export let song: SongType

	let pauseDebounce: NodeJS.Timeout = undefined

	let isMouseDown = false
	let isMouseIn = false

	let isPlaybackCursorFirstAssign = true

	let playingSongID = undefined

	$: {
		if (isPlaybackCursorFirstAssign === true) isPlaybackCursorFirstAssign = false
		else {
			$playbackCursor
			getWaveformImage($playbackCursor[0])
		}
	}

	async function getWaveformImage(index: number) {
		let song = $playbackStore?.[index]

		if (song.ID === playingSongID) return

		playingSongID = song.ID

		// Fade Out
		document.documentElement.style.setProperty('--waveform-opacity', '0')

		setWaveSource(song.SourceFile, song.Duration).then(() => {
			setTimeout(() => {
				let currentSongPlaying = $playbackStore[$playbackCursor[0]]

				if (currentSongPlaying.ID === song.ID) {
					document.documentElement.style.setProperty('--waveform-opacity', '1')
				}
			}, 250)
		})
	}

	onMount(() => {
		createWaveFormElement('#waveform-data')
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

		playerProgress.addEventListener('mousemove', (evt) => {
			if (isMouseDown && isMouseIn) applyProgressChange(evt)
		})

		playerProgress.addEventListener('click', (evt) => applyProgressChange(evt))

		function applyProgressChange(evt: Event) {
			player.pause()

			playerForeground.classList.add('not-smooth')

			let playerWidth = playerProgress['scrollWidth']

			let selectedPercent = Math.ceil((100 / playerWidth) * evt['offsetX'])

			document.documentElement.style.setProperty('--song-time', `${selectedPercent}%`)

			clearTimeout(pauseDebounce)

			pauseDebounce = setTimeout(() => {
				player.currentTime = song['Duration'] / (100 / selectedPercent)
				playerForeground.classList.remove('not-smooth')
				player.play()
			}, 500)
		}
	}
</script>

<player-progress>
	<progress-foreground />
	<div id="waveform-data" />
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
		mix-blend-mode: soft-light;
		background-color: rgba(0, 0, 0, 0.5);
		/* mix-blend-mode: hard-light;
		background-color: var(--high-color); */
		min-width: var(--song-time);
		transition: min-width 100ms linear;
	}

	player-progress #waveform-data {
		z-index: 0;
		width: 100%;
		opacity: var(--waveform-opacity);
		/* backdrop-filter: blur(0px); */
		transition: opacity 250ms linear;
	}
</style>
