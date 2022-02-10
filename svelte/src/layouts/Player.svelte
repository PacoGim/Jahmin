<script lang="ts">
	import { onMount } from 'svelte'

	import NextButton from './components/NextButton.svelte'
	import PreviousButton from './components/PreviousButton.svelte'
	import PlayButton from './components/PlayButton.svelte'
	import PlayerProgress from './components/PlayerProgress.svelte'
	import PlayerVolumeBar from './components/PlayerVolumeBar.svelte'
	import AlbumArt from '../components/AlbumArt.svelte'

	import type { SongType } from '../types/song.type'

	import { context, source } from '../store/equalizer.store'
	import {
		albumPlayingIdStore,
		isPlaying,
		playbackCursor,
		playbackStore,
		playerElement,
		playingSongStore,
		songPlayingIdStore,
		updateSongProgress
	} from '../store/final.store'

	import parseDuration from '../functions/parseDuration.fn'
	import { escapeString } from '../functions/escapeString.fn'
	import { nextSong } from '../functions/nextSong.fn'

	import { setWaveSource } from '../services/waveform.service'
	import generateId from '../functions/generateId.fn'
	import { hash } from '../functions/hashString.fn'
	import { isFileExistIPC } from '../services/ipc.service'

	let progress: number = 0

	let currentSong: SongType = undefined
	let nextSongPreloaded: { Id: number; BufferUrl: string } = undefined

	let rootDir = ''

	let mainAudioElement: HTMLAudioElement = undefined
	let nextAudioElement: HTMLAudioElement = undefined

	let songTime = {
		currentTime: '00:00',
		duration: '00:00',
		timeLeft: '00:00'
	}

	$:{
		console.log($playbackCursor)
	}

	$: {
		if ($isPlaying) {
			navigator.mediaSession.playbackState = 'playing'
		} else {
			navigator.mediaSession.playbackState = 'paused'
		}
	}

	$: {
		if (mainAudioElement !== undefined && $context === undefined) {
			$context = new window.AudioContext()
			$source = $context.createMediaElementSource(mainAudioElement)
		}
	}

	$: {
		if (mainAudioElement !== undefined) {
			$playerElement = mainAudioElement
		}
	}

	$: playSong($playbackCursor)

	$: {
		// Updates the song time based of the user seeking in the player progress component.
		if ($updateSongProgress !== -1) {
			songTime = {
				currentTime: parseDuration($updateSongProgress),
				duration: parseDuration(currentSong['Duration']),
				timeLeft: parseDuration(currentSong['Duration'] - $updateSongProgress)
			}
		}
	}

	let preLoadNextSongDebounce: NodeJS.Timeout = undefined

	async function playSong(playbackCursor: [number, boolean]) {
		if (isNextAudioPlaying === true) {
			return
		}

		let playNow = playbackCursor[1]
		let songToPlay = getSongToPlay(playbackCursor[0])
		let url: string = undefined

		if (songToPlay === undefined) return

		// rootDir = undefined

		// setTimeout(() => (rootDir = songToPlay.SourceFile.split('/').slice(0, -1).join('/')), 1)

		rootDir = songToPlay.SourceFile.split('/').slice(0, -1).join('/')

		if (songToPlay?.ID === nextSongPreloaded?.Id) {
			url = nextSongPreloaded.BufferUrl
		} else if (songToPlay?.ID) {
			url = escapeString(songToPlay['SourceFile'])
		} else {
			mainAudioElement.pause()
			mainAudioElement.src = ''
			$isPlaying = false
			return
		}

		mainAudioElement.src = url

		currentSong = songToPlay
		$playingSongStore = currentSong

		songTime = {
			currentTime: parseDuration(0),
			duration: parseDuration(songToPlay['Duration']),
			timeLeft: parseDuration(songToPlay['Duration'] - 0)
		}

		navigator.mediaSession.metadata = new MediaMetadata({
			title: songToPlay.Title,
			artist: songToPlay.Album
		})

		setWaveSource(songToPlay.SourceFile, $albumPlayingIdStore, songToPlay.Duration)

		if (playNow === true) {
			mainAudioElement
				.play()
				.then(() => {
					// $songPlayingIdStore = songToPlay.ID
					// localStorage.setItem('LastPlayedAlbumId', $albumPlayingIdStore)
					// localStorage.setItem('LastPlayedSongId', String(songToPlay.ID))
					// localStorage.setItem('LastPlayedSongIndex', String(playbackCursor[0]))
					// clearTimeout(preLoadNextSongDebounce)
					// preLoadNextSongDebounce = setTimeout(() => {
					// 	preLoadNextSong(playbackCursor)
					// }, 2000)
				})
				.catch(async err => {
					if ((await isFileExistIPC(songToPlay.SourceFile)) === false) {
						// If file does not exist, play next song.
						nextSong()
					}
				})
		} else {
			mainAudioElement.pause()
		}
	}

	function getSongToPlay(index: number) {
		return $playbackStore[index]
	}

	function preLoadNextSong(playbackCursor: [number, boolean]) {
		let nextSong = playbackCursor[0] + 1
		let songs = $playbackStore
		let songToPlay = songs[nextSong]

		if (songToPlay) {
			fetchSong(escapeString(songToPlay['SourceFile'])).then(buffer => {
				nextSongPreloaded = {
					Id: songToPlay.ID,
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
		mainAudioElement = document.querySelector('audio#main')
		nextAudioElement = document.querySelector('audio#next')
	})

	/* 	function stopPlayer() {
		player.removeAttribute('src')
		player.pause()
		document.documentElement.style.setProperty('--song-time', `0%`)
		$isPlaying = false

		return
	} */

	function fetchSong(songPath: string): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			fetch(songPath)
				.then(data => data.arrayBuffer())
				.then(arrayBuffer => {
					resolve(arrayBuffer)
				})
				.catch(err => {
					// console.log(err)
					//TODO Alert user that song is not found and offer a way to remove from DB.
				})
		})
	}

	function durationChanged(e) {
		// Rounds to 2 decimals.
		progress = Math.round(((100 / currentSong['Duration']) * mainAudioElement.currentTime + Number.EPSILON) * 100) / 100

		progress = progress >= 100 ? 100 : progress

		document.documentElement.style.setProperty('--song-time', `${progress}%`)

		songTime = {
			currentTime: parseDuration(mainAudioElement.currentTime),
			duration: parseDuration(currentSong['Duration']),
			timeLeft: parseDuration(currentSong['Duration'] - mainAudioElement.currentTime)
		}
	}

	let prePlayTime = 60000 / 1000

	let isMainAudioPlaying = false
	let isNextAudioPlaying = false

	let isMainAudioSongPreloaded = false
	let isNextAudioSongPreloaded = false

	function mainAudioTimeUpdate() {
		if (isNextAudioSongPreloaded === false && mainAudioElement.currentTime >= 2) {
			isNextAudioSongPreloaded = true

			let nextSongToPlay = getSongToPlay($playbackCursor[0] + 1)

			console.log(nextSongToPlay)

			nextAudioElement.src = escapeString(nextSongToPlay['SourceFile'])
		}

		if (isNextAudioPlaying === false && mainAudioElement.currentTime >= mainAudioElement.duration - prePlayTime) {
			$playbackCursor = [$playbackCursor[0] + 1, false]
			isNextAudioPlaying = true
			isMainAudioPlaying = false
			nextAudioElement.play()
			isMainAudioSongPreloaded = false
		}
	}

	function nextAudioTimeUpdate() {
		if (isMainAudioSongPreloaded === false && nextAudioElement.currentTime >= 2) {
			isMainAudioSongPreloaded = true

			let nextSongToPlay = getSongToPlay($playbackCursor[0] + 1)

			console.log(nextSongToPlay)

			mainAudioElement.src = escapeString(nextSongToPlay['SourceFile'])
		}

		if (isMainAudioPlaying === false && nextAudioElement.currentTime >= nextAudioElement.duration - prePlayTime) {
			$playbackCursor = [$playbackCursor[0] + 1, false]
			isMainAudioPlaying = true
			isNextAudioPlaying = false
			mainAudioElement.play()
			isNextAudioSongPreloaded = false
		}
	}
</script>

<audio
	id="main"
	on:pause={() => ($isPlaying = false)}
	on:play={() => ($isPlaying = true)}
	on:timeupdate={() => mainAudioTimeUpdate()}
>
	<!-- on:ended={() => nextSong()} -->
	<track kind="captions" />
</audio>

<audio
	id="next"
	on:pause={() => ($isPlaying = false)}
	on:play={() => ($isPlaying = true)}
	on:timeupdate={() => nextAudioTimeUpdate()}
>
	<!-- on:ended={() => nextSong()} -->
	<track kind="captions" />
</audio>

<player-svlt>
	{#if rootDir}
		<AlbumArt id={generateId()} albumId={hash(rootDir)} observe={false} style="height:64px;width:64px;cursor:pointer" />
	{/if}

	<player-buttons>
		<PreviousButton />
		<PlayButton />
		<NextButton />
	</player-buttons>

	<PlayerVolumeBar />

	<song-duration class="song-time">
		{songTime.currentTime}/{songTime.duration}
	</song-duration>

	<PlayerProgress song={currentSong} />

	<song-time-left class="song-time">
		-{songTime.timeLeft}
	</song-time-left>
</player-svlt>

<style>
	player-svlt {
		z-index: 3;
		grid-area: player-svlt;
		display: flex;
		align-items: center;
		background-color: var(--high-color);
		color: var(--low-color);

		transition-property: background-color, color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
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

	.song-time {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 500;
	}
	song-time-left {
		margin-right: 1rem;
	}

	:global(player-buttons > *) {
		cursor: pointer;
		margin: 0 0.75rem;
	}
</style>
