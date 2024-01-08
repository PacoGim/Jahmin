<script lang="ts">
	import { onMount } from 'svelte'
	import type { PartialSongType } from '../../../../types/song.type'
	import getDynamicArtistsFn from '../../functions/getDynamicArtists.fn'
	import { showDynamicArtistsConfig } from '../../stores/config.store'
	import { playingSongStore } from '../../stores/main.store'
	import PlayButton from '../../layouts/components/PlayButton.svelte'

	export let song: PartialSongType

	onMount(() => {
		console.log(song.ID)
		console.log($playingSongStore?.ID)
	})
</script>

<title-tag>

	<play-pause-button>

		<PlayButton customColor="#fff" customSize="16px" />

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
</style>
