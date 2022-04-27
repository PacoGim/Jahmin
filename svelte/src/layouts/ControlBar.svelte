<script lang="ts">
	import { onMount } from 'svelte'

	import NextButton from './components/NextButton.svelte'
	import PreviousButton from './components/PreviousButton.svelte'
	import PlayButton from './components/PlayButton.svelte'
	import PlayerProgress from './components/PlayerProgress.svelte'
	import PlayerVolumeBar from './components/PlayerVolumeBar.svelte'
	import AlbumArt from '../components/AlbumArt.svelte'

	import type { SongType } from '../types/song.type'

	// import { context, source } from '../store/equalizer.store'

	import {
		albumPlayingIdStore,
		isPlaying,
		playbackCursor,
		playbackStore,
		playingSongStore,
		songPlayingIdStore,
		updateSongProgress,
		currentAudioElement,
		mainAudioElement,
		altAudioElement,
		albumPlayingDirStore
	} from '../store/final.store'

	import parseDuration from '../functions/parseDuration.fn'

	import { currentPlayerTime } from '../store/player.store'
	import getDirectoryFn from '../functions/getDirectory.fn'

	let progress: number = 0

	let currentSong: SongType = undefined

	let rootDir = ''

	let songTime = {
		currentTime: '00:00',
		duration: '00:00',
		timeLeft: '00:00'
	}

	let prePlayTime = 250 / 1000

	let isMainAudioPlaying = false
	let isNextAudioPlaying = false

	let isMainAudioSongPreloaded = false
	let isNextAudioSongPreloaded = false

	$: {
		if ($currentPlayerTime !== undefined) {
			durationChanged($currentPlayerTime)
		}
	}

	$: {
		if ($playingSongStore !== undefined) {
			currentSong = $playingSongStore

			updateSongData(currentSong)
		}
	}

	function updateSongData(song: SongType) {
		songTime = {
			currentTime: parseDuration($currentPlayerTime),
			duration: parseDuration(song.Duration),
			timeLeft: parseDuration(song.Duration - $currentPlayerTime)
		}

		localStorage.setItem('LastPlayedAlbumId', $albumPlayingIdStore)
		localStorage.setItem('LastPlayedSongId', String(song.ID))
		localStorage.setItem('LastPlayedDir', String(getDirectoryFn(song.SourceFile)))
		// localStorage.setItem('LastPlayedSongIndex', String(playbackCursor[0]))
	}

	// $: console.log($currentAudioElement)

	// $: {
	// 	if ($isPlaying) {
	// 		navigator.mediaSession.playbackState = 'playing'
	// 	} else {
	// 		navigator.mediaSession.playbackState = 'paused'
	// 	}
	// }

	// $: {
	// 	if ($mainAudioElement !== undefined && $context === undefined) {
	// 		$context = new window.AudioContext()
	// 		$source = $context.createMediaElementSource($mainAudioElement)
	// 	}
	// }

	// $: if ($currentAudioElement === undefined && $mainAudioElement !== undefined) {
	// 	$currentAudioElement = $mainAudioElement
	// }

	// $: playSong($playbackCursor)

	// $: {
	// 	// Updates the song time based of the user seeking in the player progress component.
	// 	if ($updateSongProgress !== -1) {
	// 		songTime = {
	// 			currentTime: parseDuration($updateSongProgress),
	// 			duration: parseDuration(currentSong['Duration']),
	// 			timeLeft: parseDuration(currentSong['Duration'] - $updateSongProgress)
	// 		}
	// 	}
	// }

	function checkIfPlaying() {
		$isPlaying = $mainAudioElement.paused === false || $altAudioElement.paused === false
	}

	function getSongToPlay(index: number) {
		return $playbackStore[index]
	}

	function durationChanged(currentTime) {
		let duration = $playingSongStore.Duration

		// Rounds to 2 decimals.
		progress = Math.round(((100 / duration) * currentTime + Number.EPSILON) * 100) / 100

		progress = progress >= 100 ? 100 : progress

		document.documentElement.style.setProperty('--song-time', `${progress}%`)

		songTime = {
			currentTime: parseDuration(currentTime),
			duration: parseDuration(duration),
			timeLeft: parseDuration(duration - currentTime)
		}
	}
	/*
	function mainAudioTimeUpdate() {
		if (isMainAudioPlaying === true) {
			durationChanged()
		}

		if (isNextAudioSongPreloaded === false && $mainAudioElement.currentTime >= 2) {
			isNextAudioSongPreloaded = true

			let nextSongToPlay = getSongToPlay($playbackCursor[0] + 1)

			$nextAudioElement.src = escapeString(nextSongToPlay['SourceFile'])
		}

		if (isNextAudioPlaying === false && $mainAudioElement.currentTime >= $mainAudioElement.duration - prePlayTime) {
			$playbackCursor = [$playbackCursor[0] + 1, false]
			isNextAudioPlaying = true
			isMainAudioPlaying = false
			$currentAudioElement = $nextAudioElement
			$nextAudioElement.play()
			isMainAudioSongPreloaded = false
		}
	}

	function nextAudioTimeUpdate() {
		if (isNextAudioPlaying === true) {
			durationChanged()
		}

		if (isMainAudioSongPreloaded === false && $nextAudioElement.currentTime >= 2) {
			isMainAudioSongPreloaded = true

			let nextSongToPlay = getSongToPlay($playbackCursor[0] + 1)

			$mainAudioElement.src = escapeString(nextSongToPlay['SourceFile'])
		}

		if (isMainAudioPlaying === false && $nextAudioElement.currentTime >= $nextAudioElement.duration - prePlayTime) {
			$playbackCursor = [$playbackCursor[0] + 1, false]
			isMainAudioPlaying = true
			isNextAudioPlaying = false
			$currentAudioElement = $mainAudioElement
			$mainAudioElement.play()
			isNextAudioSongPreloaded = false
		}
	}
	 */

	// let element
	let artSize = 64

	onMount(() => {})
</script>

<control-bar-svlt>
	<AlbumArt rootDir={$albumPlayingDirStore} {artSize} observer="!addObserver" style="height:64px;width:64px;cursor:pointer" />

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
</control-bar-svlt>

<style>
	control-bar-svlt {
		z-index: 3;
		grid-area: control-bar-svlt;
		display: flex;
		align-items: center;
		background-color: var(--high-color);
		color: var(--low-color);

		transition-property: background-color, color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
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
