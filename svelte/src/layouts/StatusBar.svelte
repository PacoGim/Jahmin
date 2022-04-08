<script lang="ts">
	import { onMount } from 'svelte'
	import generateId from '../functions/generateId.fn'
	import ImageIcon from '../icons/ImageIcon.svelte'
	import tippyService from '../services/tippy.service'

	import { artCompressQueueProgress, playingSongStore, songSyncQueueProgress } from '../store/final.store'
	import type { SongType } from '../types/song.type'
	import AlbumInfo from './main/AlbumInfo.svelte'

	let currentSong: SongType = {
		Track: 0,
		Title: '',
		Artist: ''
	}

	let tippyId = generateId()

	$: {
		if ($playingSongStore) {
			currentSong = $playingSongStore

			tippyService(tippyId, null, {
				content: `<bold>${fixNumber(currentSong.Track)}</bold> <bold>${currentSong.Title || ''}</bold> by
		<bold>${currentSong.Artist || ''}</bold>`
			})
		}
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
			<ImageIcon style="fill:var(--low-color);height: 20px;width: 20px;margin-right: .5rem;" />
			<span>{$songSyncQueueProgress.currentLength}</span>/
			<span>{$songSyncQueueProgress.maxLength}</span>
		</song-sync-queue>
		<!-- Image Process -->
		<!-- Song Add Process -->
		<!-- Song Update Process -->
	</queue-processes>
	<song-info>
		<bold>{fixNumber(currentSong.Track)}</bold> <bold>{currentSong.Title || ''}</bold> by
		<bold>{currentSong.Artist || ''}</bold>
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
