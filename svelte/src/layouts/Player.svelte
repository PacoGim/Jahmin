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
	let currentAudioElement: HTMLAudioElement = undefined

	let rootDir = ''

	let mainAudioElement: HTMLAudioElement = undefined
	let nextAudioElement: HTMLAudioElement = undefined

	let songTime = {
		currentTime: '00:00',
		duration: '00:00',
		timeLeft: '00:00'
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

	async function playSong(playbackCursor: [number, boolean]) {
		let songToPlay = getSongToPlay(playbackCursor[0])

		if (songToPlay === undefined) {
			return
		}

		rootDir = undefined
		rootDir = songToPlay.SourceFile.split('/').slice(0, -1).join('/')

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

		if (playbackCursor[1] === true) {
			mainAudioElement.src = escapeString(songToPlay['SourceFile'])

			mainAudioElement.addEventListener('canplay', function handler() {
				currentAudioElement = mainAudioElement

				nextAudioElement.src = ''

				isMainAudioPlaying = true
				isNextAudioPlaying = false
				currentAudioElement = mainAudioElement
				mainAudioElement.play()
				isNextAudioSongPreloaded = false

				this.removeEventListener('canplay', handler)
			})

			// Play song and update data
			// mainAudioElement.play()
			/*.catch(async err => {
				if ((await isFileExistIPC(songToPlay.SourceFile)) === false) {
					// If file does not exist, play next song.
					nextSong()
				}
			}) */
		}

		$songPlayingIdStore = songToPlay.ID
		localStorage.setItem('LastPlayedAlbumId', $albumPlayingIdStore)
		localStorage.setItem('LastPlayedSongId', String(songToPlay.ID))
		localStorage.setItem('LastPlayedSongIndex', String(playbackCursor[0]))
	}

	function getSongToPlay(index: number) {
		return $playbackStore[index]
	}

	onMount(() => {
		mainAudioElement = document.querySelector('audio#main')
		nextAudioElement = document.querySelector('audio#next')
	})

	function durationChanged() {
		// Rounds to 2 decimals.
		progress = Math.round(((100 / currentSong['Duration']) * currentAudioElement.currentTime + Number.EPSILON) * 100) / 100

		progress = progress >= 100 ? 100 : progress

		document.documentElement.style.setProperty('--song-time', `${progress}%`)

		songTime = {
			currentTime: parseDuration(currentAudioElement.currentTime),
			duration: parseDuration(currentSong['Duration']),
			timeLeft: parseDuration(currentSong['Duration'] - currentAudioElement.currentTime)
		}
	}

	let prePlayTime = 30000 / 1000

	let isMainAudioPlaying = false
	let isNextAudioPlaying = false

	let isMainAudioSongPreloaded = false
	let isNextAudioSongPreloaded = false

	function mainAudioTimeUpdate() {
		if (isMainAudioPlaying === true) {
			durationChanged()
		}

		if (isNextAudioSongPreloaded === false && mainAudioElement.currentTime >= 2) {
			isNextAudioSongPreloaded = true

			let nextSongToPlay = getSongToPlay($playbackCursor[0] + 1)

			nextAudioElement.src = escapeString(nextSongToPlay['SourceFile'])
		}

		if (isNextAudioPlaying === false && mainAudioElement.currentTime >= mainAudioElement.duration - prePlayTime) {
			$playbackCursor = [$playbackCursor[0] + 1, false]
			isNextAudioPlaying = true
			isMainAudioPlaying = false
			currentAudioElement = nextAudioElement
			nextAudioElement.play()
			isMainAudioSongPreloaded = false
		}
	}

	function nextAudioTimeUpdate() {
		if (isNextAudioPlaying === true) {
			durationChanged()
		}

		if (isMainAudioSongPreloaded === false && nextAudioElement.currentTime >= 2) {
			isMainAudioSongPreloaded = true

			let nextSongToPlay = getSongToPlay($playbackCursor[0] + 1)

			mainAudioElement.src = escapeString(nextSongToPlay['SourceFile'])
		}

		if (isMainAudioPlaying === false && nextAudioElement.currentTime >= nextAudioElement.duration - prePlayTime) {
			$playbackCursor = [$playbackCursor[0] + 1, false]
			isMainAudioPlaying = true
			isNextAudioPlaying = false
			currentAudioElement = mainAudioElement
			mainAudioElement.play()
			isNextAudioSongPreloaded = false
		}
	}
</script>

<audio id="main" on:pause={() => ($isPlaying = false)} on:timeupdate={() => mainAudioTimeUpdate()}>
	<!-- on:play={() => ($isPlaying = true)} -->
	<!-- on:ended={() => nextSong()} -->
	<track kind="captions" />
</audio>

<audio id="next" on:pause={() => ($isPlaying = false)} on:timeupdate={() => nextAudioTimeUpdate()}>
	<!-- on:play={() => ($isPlaying = true)} -->
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
