<script lang="ts">
	import type { TagType } from '../types/tag.type'

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

	let currentSong: TagType = undefined

	let player: HTMLAudioElement = undefined

	let drawWaveformDebounce: NodeJS.Timeout = undefined

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

	$: {
		// console.log($songList)
	}

	function playSong() {
		if ($playlist?.['SongList'] === undefined) {
			return
		}

		// currentSong = $songList[index]
		currentSong = $playlist['SongList'][$playlistIndex]

		// console.log(currentSong)

		fetch(currentSong['SourceFile'])
			.then((data) => data.arrayBuffer())
			.then((arrayBuffer) => {
				songArrayBuffer = arrayBuffer
				const blob = new Blob([songArrayBuffer])
				const url = window.URL.createObjectURL(blob)
				player.src = url
				player.play()

				$isDoneDrawing = false

				getWaveformData(songArrayBuffer).then((waveformData) => {
					clearTimeout(drawWaveformDebounce)

					drawWaveformDebounce = setTimeout(() => {
						drawWaveform(waveformData)
					}, 1000)
				})
			})
	}

	function selectSong() {}

	onMount(() => {
		player = document.querySelector('audio')

		volume = Number(localStorage.getItem('volume'))

		if (isNaN(volume) || volume > 1) {
			volume = 1
			localStorage.setItem('volume', String(volume))
		}

		player.volume = volume
	})

	function saveVolumeChange() {
		localStorage.setItem('volume', String(player.volume))
	}

	// function updateProgress() {
	// 	progress = (100 / currentSong['Duration']) * player.currentTime
	// 	document.documentElement.style.setProperty('--song-time', `${progress}%`)
	// }

	function updatePlayerDuration(evt) {
		// console.log(document.querySelector('#foo').value)
	}

	let pauseDebounce

	function changeDuration() {
		player.pause()

		//@ts-ignore
		let progressValue = document.querySelector('#inputProgress').value
		document.documentElement.style.setProperty('--song-time', `${progressValue}%`)

		clearInterval(pauseDebounce)

		pauseDebounce = setTimeout(() => {
			player.currentTime = currentSong['Duration'] / (100 / progressValue)
			player.play()
		}, 200)
	}

	let playingInterval
	let counter = 0
	// counter = counter + 100

	// if (counter === 200) {
	// 	getWaveformData(songArrayBuffer).then((waveformData) => {
	// 		drawWaveform(waveformData)
	// 	})
	// }

	function startInterval() {
		console.log('Start')
		$isPlaying = true

		// getWaveform(currentSong['SourceFile'])

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
		counter = 0
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
		<input
			id="inputProgress"
			type="range"
			min="0"
			max="100"
			step="0.1"
			on:mousedown={() => changeDuration()}
			on:input={() => changeDuration()} />
		<canvas id="progress-background" />
		<progress-foreground />
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
