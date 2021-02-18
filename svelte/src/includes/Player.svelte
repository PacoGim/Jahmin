<script lang="ts">
	import type { SongType } from '../types/song.type'

	import { onMount } from 'svelte'

	import NextButton from '../components/NextButton.svelte'
	import PreviousButton from '../components/PreviousButton.svelte'
	import PlayButton from '../components/PlayButton.svelte'
	import PlayerProgress from '../components/PlayerProgress.svelte'
	import PlayerVolumeBar from '../components/PlayerVolumeBar.svelte'

	import { isDoneDrawing, songList, waveformUrl } from '../store/index.store'
	import { playbackIndex, isPlaying, playback } from '../store/player.store'
	import { getWaveformIPCData } from '../service/waveform.service'
	import { drawWaveform } from '../service/draw.service'

	import { nextSong } from '../functions/nextSong.fn'
	import { getWaveformIPC } from '../service/ipc.service'
	import { escapeString } from '../functions/escapeString.fn'

	let progress: number = 0

	let currentSong: SongType = undefined
	let nextSongPreloaded: { ID: number; SongBuffer: ArrayBuffer } = undefined

	let player: HTMLAudioElement = undefined

	let drawWaveformDebounce: NodeJS.Timeout = undefined
	let playingInterval: NodeJS.Timeout = undefined

	$: {
		$playbackIndex

		resetProgress()

		playSong()
	}

	function resetProgress() {
		let playerForeground: HTMLElement = document.querySelector('player-progress progress-foreground')

		if (playerForeground) {
			playerForeground.classList.add('not-smooth')
			document.documentElement.style.setProperty('--song-time', `0%`)
			setTimeout(() => {
				playerForeground.classList.remove('not-smooth')
			}, 1000)
		}
	}

	$: {
		let canvasElement = document.querySelector('canvas')

		if (canvasElement) {
			canvasElement.style.opacity = $isDoneDrawing === true ? '1' : '0'
		}
	}

	onMount(() => {
		player = document.querySelector('audio')
	})

	function stopPlayer() {
		player.removeAttribute('src')
		player.pause()
		drawWaveform([0])
		document.documentElement.style.setProperty('--song-time', `0%`)
		$isPlaying = false

		return
	}

	async function playSong() {
		if ($playback?.['SongList'] === undefined) {
			return
		}

		let songBuffer = undefined

		currentSong = $playback['SongList'][$playbackIndex['indexToPlay']]

		if (currentSong === undefined) {
			return stopPlayer()
		}

		if (currentSong['$loki'] !== nextSongPreloaded?.['ID']) {
			songBuffer = await fetchSong(escapeString(currentSong['SourceFile']))
		} else {
			songBuffer = nextSongPreloaded['SongBuffer']
		}

		const blob = new Blob([songBuffer])
		const url = window.URL.createObjectURL(blob)

		player.src = url

		if ($playbackIndex['playNow'] === false) {
			player.pause()
		} else {
			player.play().catch(() => {})
		}

		localStorage.setItem('LastPlayedAlbumID', $playback['AlbumID'])
		localStorage.setItem('LastPlayedSongID', String(currentSong['$loki']))
		preLoadNextSong()
	}

	async function preLoadNextSong() {
		const nextSong: SongType = $playback['SongList'][$playbackIndex['indexToPlay'] + 1]

		if (nextSong) {
			let songBuffer = await fetchSong(escapeString(nextSong['SourceFile']))
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

	function startInterval() {
		// console.log('Start')

		$isPlaying = true

		clearInterval(playingInterval)

		playingInterval = setInterval(() => {
			progress = (100 / currentSong['Duration']) * player.currentTime

			document.documentElement.style.setProperty('--song-time', `${progress}%`)
		}, 100)
	}

	function stopInterval() {
		// console.log('Stop')
		$isPlaying = false
		clearInterval(playingInterval)
	}
</script>

<player-svlt>
	<audio controls={true} on:play={() => startInterval()} on:pause={() => stopInterval()} on:ended={() => nextSong()}>
		<track kind="captions" />
	</audio>

	<player-buttons>
		<PreviousButton {player} />
		<PlayButton {player} />
		<NextButton />
	</player-buttons>

	<PlayerVolumeBar {player} />

	<PlayerProgress {player} song={currentSong} />
</player-svlt>

<style>
	player-svlt {
		grid-area: player-svlt;
		display: flex;
		align-items: center;
		background-color: var(--high-color);

		transition: background-color 300ms ease-in-out;
	}

	audio {
		display: none;
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
</style>
