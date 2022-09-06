<script lang="ts">
	import { onMount } from 'svelte'

	import NextButton from './components/NextButton.svelte'
	import PreviousButton from './components/PreviousButton.svelte'
	import PlayButton from './components/PlayButton.svelte'
	import PlayerProgress from './components/PlayerProgress.svelte'
	import PlayerVolumeBar from './components/PlayerVolumeBar.svelte'
	import AlbumArt from '../components/AlbumArt.svelte'

	import type { SongType } from '../../../types/song.type'

	import {
		playingSongStore,
		albumPlayingDirStore,
		currentSongDurationStore,
		currentSongProgressStore
	} from '../stores/main.store'

	import parseDuration from '../functions/parseDuration.fn'

	let progress: number = 0

	let artSize = 64

	let currentSong: SongType = undefined

	let songTime = {
		currentTime: '00:00',
		duration: '00:00',
		timeLeft: '00:00'
	}

	$: {
		updateSongTime($currentSongDurationStore, $currentSongProgressStore)
	}

	function updateSongTime(songDuration, songProgress) {
		songTime = {
			currentTime: parseDuration(songProgress),
			duration: parseDuration(songDuration),
			timeLeft: parseDuration(songDuration - songProgress)
		}
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

	onMount(() => {})
</script>

<control-bar-svlt>
	<album-art>
		<AlbumArt imageSourceLocation={$playingSongStore?.SourceFile} intersectionRoot={undefined} />
	</album-art>

	<player-buttons>
		<PreviousButton />
		<PlayButton />
		<NextButton />
	</player-buttons>

	<PlayerVolumeBar />

	<song-duration class="song-time">
		{songTime.currentTime}/{songTime.duration}
	</song-duration>

	<PlayerProgress />

	<song-time-left class="song-time">
		-{songTime.timeLeft}
	</song-time-left>
</control-bar-svlt>

<style>
	control-bar-svlt {
		z-index: 3;
		grid-area: control-bar-svlt;
		display: grid;
		align-items: center;

		grid-template-columns: 64px max-content max-content max-content auto max-content;

		background-color: var(--art-color-light);
		color: var(--art-color-dark);

		transition-property: background-color, color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}

	control-bar-svlt album-art {
		height: 64px;
		width: 64px;
		cursor: pointer;
	}

	player-buttons {
		height: var(--button-size);
		display: flex;
		flex-direction: row;
		margin: 0 1rem;
	}

	.song-time {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 500;
	}

	song-duration {
		margin: 0 1rem;
	}

	song-time-left {
		margin: 0 1rem;
	}

	:global(player-buttons > *) {
		cursor: pointer;
		margin: 0 0.75rem;
	}
</style>
