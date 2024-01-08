<script lang="ts">
	import type { PartialSongType } from '../../../../types/song.type'
	import getDynamicArtistsFn from '../../functions/getDynamicArtists.fn'
	import { showDynamicArtistsConfig } from '../../stores/config.store'
	import { playingSongStore } from '../../stores/main.store'
	import PlayButton from '../../layouts/components/PlayButton.svelte'

	export let song: PartialSongType
</script>

<title-tag>
	<play-pause-button class:playing={song.ID === $playingSongStore?.ID}>
		<PlayButton customColor="#fff" customSize="12px" customMargins="0px 5px 0 0" />
	</play-pause-button>

	{song.Title || ''}

	{#if $showDynamicArtistsConfig === true}
		{getDynamicArtistsFn(song?.Artist, song?.AlbumArtist)}
	{/if}
</title-tag>

<style>
	title-tag {
		/* display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden; */
		/* display: flex; */
		/* align-items: center; */
		max-height: 22px;
	}

	play-pause-button {
		opacity: 0;

		transition: opacity 300ms ease-in-out;
	}

	play-pause-button.playing {
		opacity: 1;
	}
</style>
