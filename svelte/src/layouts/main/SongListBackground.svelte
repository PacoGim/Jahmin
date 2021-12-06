<script lang="ts">
	import { albumArtMapStore, selectedAlbumId } from '../../store/final.store'

	let previousArtVersion = undefined
	let previousArtId = undefined

	$: $selectedAlbumId, $albumArtMapStore, setArt()

	function setArt() {
		// Loads art if Art map (If image updated) or Selected Album changes.

		// Get Art from Map.
		let albumArt: any = $albumArtMapStore.get($selectedAlbumId)

		// If Found
		if (albumArt?.image !== undefined) {
			// Checks if the previous id changed.
			if (previousArtId !== $selectedAlbumId) {
				let maxValueKey = Math.max(...filterNumbersFromArray(Object.keys(albumArt.image)))

				// If changed it updates both id and version.
				previousArtId = $selectedAlbumId
				previousArtVersion = albumArt.version

				// If a art is available, load it.
				loadArt(albumArt.image[maxValueKey].filePath)

				// Checks if a new version of the album art is available
			} else if (albumArt.version !== previousArtVersion) {
				let maxValueKey = Math.max(...filterNumbersFromArray(Object.keys(albumArt.image)))

				// Updates the art version.
				previousArtVersion = albumArt.version

				loadArt(albumArt.image[maxValueKey].filePath)
			}
		}
	}

	function filterNumbersFromArray(array: any[]): number[] {
		return array.map(item => Number(item)).filter(item => !isNaN(item))
	}

	// Takes a file path and loads it to the bg image style property.
	function loadArt(artPath) {
		if (artPath) {
			let $el = document.querySelector('song-list-background-svlt')

			if ($el) {
				$el.setAttribute('style', `background-image: url('${artPath}');`)
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
		/* background-size: art; */
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
