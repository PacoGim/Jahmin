<script lang="ts">
	import { playingSongStore } from '../store/final.store'
	import type { SongType } from '../types/song.type'
	import AlbumInfo from './main/AlbumInfo.svelte'

	let currentSong: SongType = {
		Track: 0,
		Title: '',
		Artist: ''
	}

	$: {
		if ($playingSongStore) {
			currentSong = $playingSongStore
		}
	}

	function fixNumber(num: number) {
		return num < 10 ? '0' + num : num
	}
</script>

<statusbar-svlt>
	<queue-processes>
		<span>Process</span>
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

	album-info {
		grid-area: album-info;
		text-align: center;
	}

	playback-options {
		grid-area: playback-options;
	}
</style>
