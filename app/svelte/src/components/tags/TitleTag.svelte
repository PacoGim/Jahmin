<script lang="ts">
	import type { SongType } from '../../../../types/song.type'
	import getDynamicArtistsFn from '../../functions/getDynamicArtists.fn'
	import { showDynamicArtistsConfig } from '../../stores/config.store'

	export let song: SongType
	export let align
</script>

<title-tag style="justify-self: {align}">
	<!-- <content> -->
	{song.Title}
	{#if $showDynamicArtistsConfig === true}
		{getDynamicArtistsFn(song.Artist, song.AlbumArtist)}
	{/if}
	<!-- </content> -->
</title-tag>

<style>
	title-tag {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-height: 22px;
	}
</style>
