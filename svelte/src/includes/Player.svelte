<script lang="ts">
	import type { SongType } from '../types/song.type'

	import { onMount } from 'svelte'

	import { isDoneDrawing, songList } from '../store/index.store'
	import { playlistIndex, isPlaying, playlist } from '../store/player.store'
	import { getWaveformData } from '../service/waveform.service'
	import { drawWaveform } from '../service/draw.service'
	import NextButton from '../components/NextButton.svelte'
	import PreviousButton from '../components/PreviousButton.svelte'
	import PlayButton from '../components/PlayButton.svelte'

	let volume: number = 0
	let progress: number = 0
	let songArrayBuffer: ArrayBuffer

	let currentSong: SongType = undefined
	let nextSongPreloaded: { ID: number; SongBuffer: ArrayBuffer } = undefined

	/*

	{
		ID:asdpokasd,
		Buffer:<>
	}

	*/

	let player: HTMLAudioElement = undefined

	let drawWaveformDebounce: NodeJS.Timeout = undefined
	let preLoadNextSongDebounce: NodeJS.Timeout = undefined
	let pauseDebounce: NodeJS.Timeout = undefined
	let playingInterval: NodeJS.Timeout = undefined

	$: {
		$playlistIndex
		playSong()
	}

	$: {
		let canvasElement = document.querySelector('canvas')

		if (canvasElement) {
			canvasElement.style.opacity = $isDoneDrawing ? '1' : '0'
		}
	}

	$: {
		//TODO This seems to run more than once
		if (player) {
			player.volume = volume
		}
	}

	onMount(() => {
		player = document.querySelector('audio')

		volume = Number(localStorage.getItem('volume'))

		if (isNaN(volume) || volume > 1) {
			volume = 1
			localStorage.setItem('volume', String(volume))
		}

		player.volume = volume

		hookePlayerProgressEvents()
	})

	async function playSong() {
		if ($playlist?.['SongList'] === undefined) {
			return
		}

		let songBuffer = undefined

		currentSong = $playlist['SongList'][$playlistIndex]

		if (currentSong['$loki'] !== nextSongPreloaded?.['ID']) {
			console.log('Not Preloaded')
			songBuffer = await fetchSong(currentSong['SourceFile'])
		} else {
			console.log('Preloaded')
			songBuffer = nextSongPreloaded['SongBuffer']
		}

		const blob = new Blob([songBuffer])
		const url = window.URL.createObjectURL(blob)
		player.src = url
		player.play()

		$isDoneDrawing = false

		getWaveformData(songBuffer).then((waveformData) => {
			clearTimeout(drawWaveformDebounce)

			drawWaveformDebounce = setTimeout(() => {
				drawWaveform(waveformData)
			}, 1000)
		})

		clearTimeout(preLoadNextSongDebounce)

		preLoadNextSongDebounce = setTimeout(() => {
			preLoadNextSong()
		}, 2000)
	}

	async function preLoadNextSong() {
		const nextSong: SongType = $playlist['SongList'][$playlistIndex + 1]

		if (nextSong) {
			let songBuffer = await fetchSong(nextSong['SourceFile'])
			nextSongPreloaded = {
				ID: nextSong['$loki'],
				SongBuffer: songBuffer
			}
		}
	}

	function fetchSong(songPath: string): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			fetch(songPath)
				.then((data) => data.arrayBuffer())
				.then((arrayBuffer) => {
					resolve(arrayBuffer)
				})
		})
	}

	function saveVolumeChange() {
		localStorage.setItem('volume', String(player.volume))
	}

	function startInterval() {
		console.log('Start')
		$isPlaying = true

		clearInterval(playingInterval)

		playingInterval = setInterval(() => {
			progress = (100 / currentSong['Duration']) * player.currentTime
			document.documentElement.style.setProperty('--song-time', `${progress}%`)
		}, 100)
	}

	function stopInterval() {
		console.log('Stop')
		$isPlaying = false
		clearInterval(playingInterval)
	}

	let isMouseDown = false
	let isMouseIn = false

	function hookePlayerProgressEvents() {
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

<player-svlt>
	<audio
		controls={true}
		on:play={() => startInterval()}
		on:pause={() => stopInterval()}
		on:ended={() => $playlistIndex++}
		on:volumechange={() => saveVolumeChange()}>
		<track kind="captions" />
	</audio>

	<player-buttons>
		<PreviousButton {player} />
		<PlayButton {player} />
		<NextButton />
	</player-buttons>

	<input type="range" min="0" max="1" step="0.01" bind:value={volume} />

	<player-progress>
		<progress-foreground />
		<canvas id="progress-background" />
	</player-progress>
</player-svlt>

<style>
	player-svlt {
		grid-area: player-svlt;
		display: flex;
		align-items: center;
		background-color: var(--hi-color);

		transition: background-color 300ms ease-in-out;
	}

	audio {
		position: fixed;
		top: 0;
		left: 0;
	}

	player-buttons {
		height: var(--button-size);
		display: flex;
		flex-direction: row;
	}

	:global(player-buttons > *) {
		cursor: pointer;
		margin: 0 0.75rem;
	}

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
	player-progress input {
		opacity: 0;
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		height: 64px;
		width: 100%;
		z-index: 2;
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
		/* background-color: rgba(255, 255, 255, 0.25); */
		width: 100%;
	}
</style>
