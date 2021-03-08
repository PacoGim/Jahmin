<script lang="ts">
	import type { SongType } from '../types/song.type'

	import { onMount } from 'svelte'

	import NextButton from '../components/NextButton.svelte'
	import PreviousButton from '../components/PreviousButton.svelte'
	import PlayButton from '../components/PlayButton.svelte'
	import PlayerProgress from '../components/PlayerProgress.svelte'
	import PlayerVolumeBar from '../components/PlayerVolumeBar.svelte'

	import { isDoneDrawing, songList, waveformUrl } from '../store/index.store'
	import { isPlaying } from '../store/final.store'
	import { getWaveformIPCData } from '../service/waveform.service'
	import { drawWaveform } from '../service/draw.service'

	import { nextSong } from '../functions/nextSong.fn'
	import { getWaveformIPC } from '../service/ipc.service'
	import { escapeString } from '../functions/escapeString.fn'
	import { albumPlayingIdStore, playbackCursor, playbackStore } from '../store/final.store'

	let progress: number = 0

	let currentSong: SongType = undefined
	let nextSongPreloaded: { ID: number; BufferUrl: string } = undefined

	let player: HTMLAudioElement = undefined

	let drawWaveformDebounce: NodeJS.Timeout = undefined
	let playingInterval: NodeJS.Timeout = undefined

	let firstplaybackCursorAssignment = true

	$: {
		if (firstplaybackCursorAssignment === true) {
			firstplaybackCursorAssignment = false
		} else {
			// resetProgress()

			playSong($playbackCursor)
		}
	}

	let preLoadNextSongDebounce: NodeJS.Timeout = undefined

	async function playSong(playbackCursor: [number, boolean]) {
		let indexToPlay = playbackCursor[0]
		let doPlayNow = playbackCursor[1]
		let songs = $playbackStore
		let songToPlay = songs[indexToPlay]
		let url: string = undefined

		if (songToPlay?.ID === nextSongPreloaded?.ID) {
			url = nextSongPreloaded.BufferUrl
		} else if (songToPlay?.ID) {
			let songBuffer = await fetchSong(escapeString(songToPlay['SourceFile']))
			url = getUrlFromBuffer(songBuffer)
		} else {
			player.pause()
			player.src = ''
			$isPlaying = false
			return
		}

		player.src = url

		currentSong = songToPlay

		if (doPlayNow === true) {
			player
				.play()
				.then(() => {
					localStorage.setItem('LastPlayedAlbumID', $albumPlayingIdStore)
					localStorage.setItem('LastPlayedSongID', String(songToPlay.ID))

					clearTimeout(preLoadNextSongDebounce)

					preLoadNextSongDebounce = setTimeout(() => {
						preLoadNextSong(playbackCursor)
					}, 500)
				})
				.catch((err) => {})
		} else {
			player.pause()
		}
	}

	function preLoadNextSong(playbackCursor: [number, boolean]) {
		let nextSong = playbackCursor[0] + 1
		let songs = $playbackStore
		let songToPlay = songs[nextSong]

		if (songToPlay) {
			fetchSong(escapeString(songToPlay['SourceFile'])).then((buffer) => {
				nextSongPreloaded = {
					ID: songToPlay.ID,
					BufferUrl: getUrlFromBuffer(buffer)
				}
			})
		}
	}

	function getUrlFromBuffer(targetBuffer) {
		return window.URL.createObjectURL(new Blob([targetBuffer]))
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

	function fetchSong(songPath: string): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			fetch(songPath)
				.then((data) => data.arrayBuffer())
				.then((arrayBuffer) => {
					resolve(arrayBuffer)
				})
				.catch((err) => {
					//TODO Alert user that song is not found and offer a way to remove from DB.
					console.log('OOPS', err)
				})
		})
	}

	function startInterval() {
		$isPlaying = true

		clearInterval(playingInterval)

		playingInterval = setInterval(() => {

			// Rounds to 2 decimals.
			progress = Math.round(((100 / currentSong['Duration']) * player.currentTime + Number.EPSILON) * 100) / 100

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
