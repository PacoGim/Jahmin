<script lang="ts">
	import AlbumArt from '../../components/AlbumArt.svelte'
	import getDirectoryFn from '../../functions/getDirectory.fn'

	import { playingSongStore, selectedAlbumsDir, windowResize } from '../../stores/main.store'

	let imageSourceLocation = ''

	$: findImage($selectedAlbumsDir, $playingSongStore)

	function findImage(selectedAlbumsDir, playingSongStore) {
		if (selectedAlbumsDir.length > 1) {
			imageSourceLocation = getDirectoryFn(playingSongStore.SourceFile)
		} else {
			imageSourceLocation = selectedAlbumsDir?.[selectedAlbumsDir?.length - 1]
		}
	}
</script>

<song-list-background-svlt>
	{#key $windowResize}
		<backdrop />
	{/key}

	<AlbumArt {imageSourceLocation} />
</song-list-background-svlt>

<style>
	song-list-background-svlt backdrop {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.33);
		backdrop-filter: blur(50px);
		z-index: 1;
	}
	song-list-background-svlt {
		grid-area: song-list-svlt;
		position: relative;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	:global(song-list-background-svlt art-svlt:not(:has(*))) {
		background-image: none !important;
		background-color: transparent !important;
	}

	:global(song-list-background-svlt art-svlt) {
		/* filter: blur(50px); */
		width: 100% !important;
	}
</style>
