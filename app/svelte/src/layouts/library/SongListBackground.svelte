<script lang="ts">
	import AlbumArt from '../../components/AlbumArt.svelte'
	import getDirectoryFn from '../../functions/getDirectory.fn'
	import { songAmountConfig } from '../../stores/config.store'

	import { playingSongStore, selectedAlbumsDir, windowResize } from '../../stores/main.store'

	export let width = '100%'

	let imageSourceLocation = ''

	$: findImage($selectedAlbumsDir, $playingSongStore)

	function findImage(selectedAlbumsDir, playingSongStore) {
		if (selectedAlbumsDir.length > 1) {
			imageSourceLocation = getDirectoryFn(playingSongStore?.SourceFile)
		} else {
			imageSourceLocation = selectedAlbumsDir?.[selectedAlbumsDir?.length - 1]
		}
	}
</script>

<song-list-background-svlt style={`width: ${width || '100%'}`}>
	{#key $windowResize}
		<backdrop />
	{/key}

	{#key $songAmountConfig}
		<AlbumArt {imageSourceLocation} />
	{/key}
</song-list-background-svlt>

<style>
	song-list-background-svlt {
		position: absolute;
		top: 0;
		left: 0;
		/* width: 100%; */
		height: 100%;

		pointer-events: none;
		z-index: -1;
	}
	song-list-background-svlt backdrop {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.33);
		backdrop-filter: blur(200px);
		z-index: 0;
	}
	:global(song-list-background-svlt art-svlt:not(:has(*))) {
		background-image: none !important;
		background-color: transparent !important;
	}

	:global(song-list-background-svlt art-svlt) {
		width: 100% !important;
	}
</style>
