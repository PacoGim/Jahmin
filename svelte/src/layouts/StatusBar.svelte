<script lang="ts">
	import { onMount } from 'svelte'
	import generateId from '../functions/generateId.fn'
	import ImageIcon from '../icons/ImageIcon.svelte'
	import MusicNoteIcon from '../icons/MusicNoteIcon.svelte'
	import tippyService from '../services/tippy.service'

	import { artCompressQueueProgress, dbSongsStore, playingSongStore, songSyncQueueProgress } from '../store/final.store'
	import type { SongType } from '../types/song.type'
	import AlbumInfo from './main/AlbumInfo.svelte'

	let currentSong: SongType = {
		Track: 0,
		Title: '',
		Artist: ''
	}

	let tippyId = generateId()

	let currentSongSyncProgress = 0

	$: {
		if ($playingSongStore) {
			currentSong = $playingSongStore

			tippyService(tippyId, null, {
				content: `<bold>${fixNumber(currentSong.Track)}</bold> <bold>${currentSong.Title || ''}</bold> by
		<bold>${currentSong.Artist || ''}</bold>`
			})
		}
	}

	$: calculateProgress($songSyncQueueProgress)

	function calculateProgress(songSyncQueueProgress) {
		let progress = 100 - Math.ceil((100 / songSyncQueueProgress.maxLength) * songSyncQueueProgress.currentLength)

		if (Math.abs(progress) === Infinity || isNaN(progress)) {
			currentSongSyncProgress = 100
		} else {
			currentSongSyncProgress = progress
		}

		document.documentElement.style.setProperty('--song-sync-queue-progress', progress + 'px')
	}

	function fixNumber(num: number) {
		return num < 10 ? '0' + num : num
	}

	onMount(() => {
		tippyService(tippyId, 'song-info', '')
	})
</script>

<statusbar-svlt>
	<queue-processes>
		<art-compress-queue>
			<ImageIcon style="fill:var(--low-color);height: 20px;width: 20px;margin-right: .5rem;" />
			<span>{$artCompressQueueProgress.currentLength}</span>/
			<span>{$artCompressQueueProgress.maxLength}</span>
		</art-compress-queue>
		<song-sync-queue>
			<MusicNoteIcon style="fill:var(--low-color);height: 20px;width: 20px;margin-right: .5rem;" />
			<span>
				{currentSongSyncProgress}%
			</span>
			<song-sync-queue-progress data-progress={currentSongSyncProgress} />
		</song-sync-queue>
		<!-- Image Process -->
		<!-- Song Add Process -->
		<!-- Song Update Process -->
	</queue-processes>
	<song-info>
		{#if currentSong?.Title !== ''}
			<bold>{fixNumber(currentSong.Track)}</bold> <bold>{currentSong.Title || ''}</bold> by
			<bold>{currentSong.Artist || ''}</bold>
		{/if}
	</song-info>
	<AlbumInfo />
	<playback-options>
		<!-- Repeat -->
		<!-- Shuffle -->
		<!-- Etc -->
		<span>playback options</span>
	</playback-options>
</statusbar-svlt>

<style>
	statusbar-svlt {
		grid-area: statusbar-svlt;
		display: grid;

		align-items: center;

		grid-template-columns: 1fr 1fr 1fr auto;
		grid-template-areas: 'queue-processes song-info album-info-svlt playback-options';

		height: 32px;

		color: var(--high-color);
		background-color: var(--low-color);

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;

		overflow: hidden;
		position: relative;
	}

	bold {
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}

	queue-processes {
		grid-area: queue-processes;

		display: flex;

		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}

	art-compress-queue {
		color: var(--low-color);
		display: flex;
		align-items: center;

		max-height: 32px;

		background-color: var(--high-color);
		width: max-content;

		padding: 0.5rem;
	}

	song-sync-queue {
		color: var(--low-color);
		display: flex;
		align-items: center;

		max-height: 32px;

		background-color: var(--high-color);
		width: max-content;

		padding: 0.5rem;
	}
	song-sync-queue song-sync-queue-progress {
		margin-left: 0.5rem;
		display: block;
		height: 8px;
		width: 100px;
		border-radius: 50px;
		background-color: var(--base-color);
		border: 1px solid var(--low-color);
	}

	song-sync-queue song-sync-queue-progress::before {
		content: '';
		display: block;
		height: 100%;
		width: var(--song-sync-queue-progress);
		border-radius: 50px;
		background-color: var(--low-color);
	}

	song-info {
		grid-area: song-info;

		font-size: 0.9rem;

		text-align: center;
		font-variation-settings: 'wght' calc(var(--default-weight) - 100);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	playback-options {
		grid-area: playback-options;
	}
</style>
