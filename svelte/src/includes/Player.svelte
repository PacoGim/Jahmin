<script lang="ts">
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'

	import type { TagType } from '../../types/tag.type'

	import { onMount } from 'svelte'

	import { songList } from '../store/index.store'
	import { songIndex } from '../store/player.store'

	let volume: number = 0
	let progress: number = 0

	let currentSong: TagType = undefined

	$: {
		playSong($songIndex)
	}

	$: {
		//TODO This seems to run more than once
		if (player) {
			player.volume = volume
		}
	}

	let player: HTMLAudioElement = undefined

	function playSong(index) {
		if (index === null) return false

		if ($songList === undefined) {
			return setTimeout(() => {
				playSong(index)
			}, 1000)
		}

		currentSong = $songList[index]

		player.src = currentSong['SourceFile']
		player.play()
	}

	function selectSong() {}

	onMount(() => {
		player = document.querySelector('audio')

		volume = Number(localStorage.getItem('volume'))

		if (isNaN(volume) || volume > 1) {
			volume = 1
			localStorage.setItem('volume', String(volume))
		}

		// player.volume = volume
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

	function bar() {
		player.pause()

		let progressValue = document.querySelector('#inputProgress').value
		document.documentElement.style.setProperty('--song-time', `${progressValue}%`)

		clearInterval(pauseDebounce)

		pauseDebounce = setTimeout(() => {
			player.currentTime = currentSong['Duration'] / (100 / progressValue)
			player.play()
		}, 200)
	}

	let playingInterval

	function startInterval() {
		console.log('Start')
		clearInterval(playingInterval)

		playingInterval = setInterval(() => {

			progress = (100 / currentSong['Duration']) * player.currentTime
			document.documentElement.style.setProperty('--song-time', `${progress}%`)
		}, 100)
	}

	function stopInterval() {
		console.log('Stop')
		clearInterval(playingInterval)
	}
</script>

<player-svlt>
	<!-- <h1>Player</h1> -->
	<audio
		controls={true}
		on:play={() => startInterval()}
		on:pause={() => stopInterval()}
		on:ended={() => $songIndex++}
		on:volumechange={() => saveVolumeChange()}>
		<track kind="captions" />
	</audio>
	<input type="range" min="0" max="1" step="0.01" bind:value={volume} />
	<span>{Math.floor(volume * 100)}</span>
	<!-- <span>|</span> -->
	<player-progress>
		<input
			id="inputProgress"
			type="range"
			min="0"
			max="100"
			step="0.1"
			on:mousedown={() => bar()}
			on:input={() => bar()} />
		<progress-background />
		<progress-foreground>{Math.round(progress)}%</progress-foreground>
	</player-progress>
</player-svlt>

<style>
	player-svlt {
		grid-area: player-svlt;
		display: flex;
		/* background-color: rgba(255,255,255,.25); */
	}

	player-progress {
		position: relative;
		width: 100%;
	}

	player-progress > * {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		height: 16px;
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
		background-color: rgba(255,255,255,.25);
		min-width: var(--song-time);
		transition: min-width 100ms linear;
	}

	player-progress progress-background {
		z-index: 0;
		background-color: rgba(255,255,255,.25);
		width: 100%;
	}
</style>
