<script lang="ts">
	import type { SongType } from '../types/song.type'

	import { onMount } from 'svelte'

	import NextButton from '../components/NextButton.svelte'
	import PreviousButton from '../components/PreviousButton.svelte'
	import PlayButton from '../components/PlayButton.svelte'
	import PlayerProgress from '../components/PlayerProgress.svelte'
	import PlayerVolumeBar from '../components/PlayerVolumeBar.svelte'

	import { isDoneDrawing, songList } from '../store/index.store'
	import { playbackIndex, isPlaying, playback } from '../store/player.store'
	import { getWaveformData } from '../service/waveform.service'
	import { drawWaveform } from '../service/draw.service'

	let progress: number = 0

	let currentSong: SongType = undefined
	let nextSongPreloaded: { ID: number; SongBuffer: ArrayBuffer } = undefined

	let player: HTMLAudioElement = undefined

	let drawWaveformDebounce: NodeJS.Timeout = undefined
	let playingInterval: NodeJS.Timeout = undefined

	$: {
		$playbackIndex
		playSong()
	}

	$: {
		let canvasElement = document.querySelector('canvas')

		if (canvasElement) {
			canvasElement.style.opacity = $isDoneDrawing ? '1' : '0'
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

		//TODO When setting album and song from storage, the song list is empty

		if ($playback?.['SongList'] === undefined) {
			return
		}

		let songBuffer = undefined

		currentSong = $playback['SongList'][$playbackIndex['indexToPlay']]

		if (currentSong === undefined) {
			return stopPlayer()
		}

		if (currentSong['$loki'] !== nextSongPreloaded?.['ID']) {
			songBuffer = await fetchSong(currentSong['SourceFile'])
		} else {
			songBuffer = nextSongPreloaded['SongBuffer']
		}

		const blob = new Blob([songBuffer])
		const url = window.URL.createObjectURL(blob)
		player.src = url

		localStorage.setItem('LastPlayedAlbumID', $playback['AlbumID'])
		localStorage.setItem('LastPlayedSongID', String(currentSong['$loki']))

		if ($playbackIndex['playNow'] === false) {
			player.pause()
		} else {
			player.play()
		}

		$isDoneDrawing = false

		getWaveformData(songBuffer).then((waveformData) => {
			clearTimeout(drawWaveformDebounce)

			drawWaveformDebounce = setTimeout(() => {
				if ($isPlaying) {
					drawWaveform(waveformData)
				}
			}, 1000)
		})

		preLoadNextSong()
	}

	async function preLoadNextSong() {
		console.time()
		const nextSong: SongType = $playback['SongList'][$playbackIndex['indexToPlay'] + 1]

		if (nextSong) {
			let songBuffer = await fetchSong(nextSong['SourceFile'])
			console.timeEnd()
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
</script>

<player-svlt>
	<audio
		controls={true}
		on:play={() => startInterval()}
		on:pause={() => stopInterval()}
		on:ended={() => $playbackIndex['indexToPlay']++}>
		<track kind="captions" />
	</audio>

	<player-buttons>
		<PreviousButton {player} />
		<PlayButton {player} />
		<NextButton />
	</player-buttons>

	<PlayerVolumeBar {player} />

	<PlayerProgress {player} {currentSong} />
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
