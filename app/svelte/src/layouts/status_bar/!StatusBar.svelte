<script lang="ts">
	import { onMount } from 'svelte'
	import tippyService from '../../services/tippy.service'

	import { playingSongStore } from '../../stores/main.store'

	import type { PartialSongType } from '../../../../types/song.type'

	import generateId from '../../functions/generateId.fn'
	import numberZeroPad from '../../functions/numberZeroPad'

	import AlbumInfo from '../library/AlbumInfo.svelte'

	import Queues from './Queues.svelte'
	import PlaybackOptions from './PlaybackOptions.svelte'
	import traduceFn from '../../functions/traduce.fn'

	let currentSong: PartialSongType = {
		Track: 0,
		Title: '',
		Artist: ''
	}

	let tippySongInfoId = generateId()
	let songInfo = ''

	$: {
		if ($playingSongStore) {
			currentSong = $playingSongStore

			songInfo = traduceFn('<bold>${trackNumber}</bold> <bold>${songTitle}</bold> by <bold>${songArtist}</bold>', {
				trackNumber: numberZeroPad(currentSong.Track),
				songTitle: currentSong.Title || '',
				songArtist: currentSong.Artist || ''
			})

			tippyService(tippySongInfoId, null, {
				content: songInfo
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
			{@html songInfo}
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

		width: 100vw;
	}

	song-info {
		font-variation-settings: 'wght' calc(var(--default-weight) + 100);

		text-align: center;
		font-size: 0.9rem;

		padding: 0 0.5rem;

		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>
