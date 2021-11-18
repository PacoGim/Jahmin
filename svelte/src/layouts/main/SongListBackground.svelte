<script lang="ts">
	import { albumCoverArtMapStore, selectedAlbumId } from '../../store/final.store'

	let previousCoverArtVersion = undefined
	let previousCoverArtId = undefined

	$: {
		// Loads cover if Cover Art map (If image updated) or Selected Album changes.

		// Get Cover Art from Map.
		let coverArt = $albumCoverArtMapStore.get($selectedAlbumId)

		// If Found
		if (coverArt) {
			// Checks if the previous id changed.
			if (previousCoverArtId !== $selectedAlbumId) {
				// If changed it updates both id and version.
				previousCoverArtId = $selectedAlbumId
				previousCoverArtVersion = coverArt.version

				// If a cover is available, load it.

				loadCover(coverArt.filePath)

				// Checks if a new version of the album cover is available
			} else if (coverArt.version !== previousCoverArtVersion) {
				// Updates the cover version.
				previousCoverArtVersion = coverArt.version

				loadCover(coverArt.filePath)
			}
		}
	}

	// Takes a file path and loads it to the bg image style property.
	function loadCover(coverArtPath) {
		if (coverArtPath) {
			let $el = document.querySelector('song-list-background-svlt')

			if ($el) {
				$el.setAttribute('style', `background-image: url('${coverArtPath}');`)
			}
		}
	}
</script>

<song-list-background-svlt />

<style>
	song-list-background-svlt {
		grid-area: song-list-svlt;
		position: relative;
		width: 100%;
		height: 100%;
		pointer-events: none;

		/* background-image: url('/Users/fran/Library/Application Support/Jahmin/art/192/dn8dyp.webp'); */
		/* background-size: cover; */
		background-repeat: no-repeat;
		background-size: 100% 100%;
		z-index: 1;

		transition: background-image 300ms;
	}

	song-list-background-svlt::before {
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(100px);
		/* z-index: 2; */
	}
</style>
