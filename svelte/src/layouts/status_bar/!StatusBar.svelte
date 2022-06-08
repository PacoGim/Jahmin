<script lang="ts">
	import { onMount } from 'svelte'
	import tippyService from '../../services/tippy.service'

	import { playingSongStore } from '../../store/final.store'

	import type { PartialSongType } from '../../types/song.type'

	import generateId from '../../functions/generateId.fn'
	import numberZeroPad from '../../functions/numberZeroPad'

	import AlbumInfo from '../library/AlbumInfo.svelte'

	import Queues from './Queues.svelte'
	import PlaybackOptions from './PlaybackOptions.svelte'

	let currentSong: PartialSongType = {
		Track: 0,
		Title: '',
		Artist: ''
	}

	let tippySongInfoId = generateId()

	$: {
		if ($playingSongStore) {
			currentSong = $playingSongStore

			tippyService(tippySongInfoId, null, {
				content: `<bold>${numberZeroPad(currentSong.Track)}</bold> <bold>${currentSong.Title || ''}</bold> by
		<bold>${currentSong.Artist || ''}</bold>`
			})
		}
	}

	onMount(() => {
		tippyService(tippySongInfoId, 'song-info', '')
	})
</script>

<statusbar-svlt>
	<Queues />
	<song-info>
		{#if currentSong?.Title !== ''}
			<bold>{numberZeroPad(currentSong.Track)}</bold> <bold>{currentSong.Title || ''}</bold> by
			<bold>{currentSong.Artist || ''}</bold>
		{/if}
	</song-info>
	<AlbumInfo />
	<PlaybackOptions />
</statusbar-svlt>

<style>
	statusbar-svlt {
		grid-area: statusbar-svlt;
		display: grid;

		align-items: center;

		grid-template-columns: max-content auto max-content max-content;
		grid-template-areas: 'queue-processes song-info album-info-svlt playback-options';

		height: 32px;

		color: var(--art-color-light);
		background-color: var(--art-color-dark);

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;

		overflow: hidden;
		position: relative;
	}

	bold {
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}



	song-info {
		text-align: center;
		font-size: 0.9rem;
	}
</style>
