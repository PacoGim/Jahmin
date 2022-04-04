<script lang="ts">
	import { getFileHashIPC } from '../../services/ipc.service'

	import { albumArtMapStore, selectedAlbumId, songListBackgroundImage } from '../../store/final.store'

	$: {
		if ($selectedAlbumId !== undefined) setArt()
	}

	$: $songListBackgroundImage, setArt()

	function setArt() {

		if ($songListBackgroundImage.albumId !== $selectedAlbumId) {

			//

		} else {



		}

		// loadArt(maxArtSizeData.artPath, maxArtSizeData.artType)
	}

	function filterNumbersFromArray(array: any[]): number[] {
		return array.map(item => Number(item)).filter(item => !isNaN(item))
	}

	let imageTransitionDebounce = undefined

	// Takes a file path and loads it to the bg image style property.
	function loadArt(artPath, artType) {
		if (artPath && artType) {
			console.log(artPath, artType)

			let $el = document.querySelector('song-list-background-svlt img')

			if ($el) {
				$el.style.opacity = 0

				clearTimeout(imageTransitionDebounce)

				imageTransitionDebounce = setTimeout(() => {
					$el.setAttribute('src', artPath)
					$el.style.opacity = 1
				}, 300)
			}
		}
	}
</script>

<song-list-background-svlt>
	<backdrop />
	<img alt="" />

	<video autoplay loop>
		<track kind="captions" />
		<source />
	</video>
</song-list-background-svlt>

<style>
	song-list-background-svlt img,
	song-list-background-svlt video {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		z-index: 0;

		transition: opacity 300ms linear;
	}

	song-list-background-svlt backdrop {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(100px);
		z-index: 1;
	}
	song-list-background-svlt {
		grid-area: song-list-svlt;
		position: relative;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
