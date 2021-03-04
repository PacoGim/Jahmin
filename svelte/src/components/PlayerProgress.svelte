<script lang="ts">
	import { onMount } from 'svelte'
	import { getWaveformIPC } from '../service/ipc.service'
	import { playbackCursor } from '../store/final.store'
	// import { playback } from '../store/player.store'
	import type { SongType } from '../types/song.type'

	export let player: HTMLAudioElement
	export let song: SongType

	let pauseDebounce: NodeJS.Timeout = undefined

	let isMouseDown = false
	let isMouseIn = false

	let progressBackgroundEl: HTMLImageElement = undefined

	$: {
		$playbackCursor
		// fetchWave()
	}

	// async function fetchWave() {
	// 	if ($playback?.SongList.length > 0) {
	// 		// Keeps track of the song the getWaveformIPC fn was called for
	// 		let tempSong = $playback['SongList'][$playbackCursor['indexToPlay']]

	// 		progressBackgroundEl.style.opacity = '0'

	// 		getWaveformIPC(tempSong['SourceFile']).then((waveformUrl) => {
	// 			setTimeout(() => {
	// 				// Gets the actual song playing
	// 				let currentSongPlaying = $playback['SongList'][$playbackCursor['indexToPlay']]

	// 				/*
	// 				If the temporary song and the actual playing song match, it shows the waveform
	// 				Prevents the multiple waveform show back to back and makes sure the proper waveform is for the proper song.
	// 				*/
	// 				if (tempSong['$loki'] === currentSongPlaying['$loki']) {
	// 					progressBackgroundEl.src = waveformUrl
	// 					progressBackgroundEl.style.opacity = '1'
	// 				}
	// 			}, 250)
	// 		})
	// 	}
	// }

	onMount(() => {
		hookPlayerProgressEvents()
		progressBackgroundEl = document.querySelector('img#progress-background')
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
	<img id="progress-background" src="" alt="" />
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

	player-progress #progress-background {
		z-index: 0;
		width: 100%;
		opacity: 0;
		/* opacity: 1; */
		transition: opacity 250ms linear;
	}
</style>
