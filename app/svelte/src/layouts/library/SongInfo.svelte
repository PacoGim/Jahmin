<script lang="ts">
	import type { SongType } from '../../../../types/song.type'
	import { playingSongStore } from '../../stores/main.store'

	let playingSong: SongType = undefined

	$: {
		if ($playingSongStore) {
			playingSong = $playingSongStore as SongType
		}
	}
</script>

<song-info-svlt>
	{#if playingSong}
		<p>{playingSong.Title}</p>
	{/if}
</song-info-svlt>

<style>
	song-info-svlt {
		background-color: var(--art-color-light);
		color: var(--art-color-dark);
		grid-area: song-info-svlt;
		text-align: right;

		transition-property: background-color, color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}

	p {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
