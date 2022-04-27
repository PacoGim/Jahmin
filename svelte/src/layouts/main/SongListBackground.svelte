<script lang="ts">
	import { onMount } from 'svelte'
	import { hash } from '../../functions/hashString.fn'

	import { albumArtMapStore, selectedAlbumDir } from '../../store/final.store'

	$: {
		if ($selectedAlbumDir !== undefined) setArt()
	}

	let setArtRetryCounter = 0

	function setArt() {
		// If the map is empty
		if ($albumArtMapStore.size <= 0) {
			// Prevents checking forever whenever the map gets filled.
			if (setArtRetryCounter === 10) {
				setArtRetryCounter = 0
				return
			}

			setTimeout(() => {
				setArtRetryCounter++
				setArt()
			}, 100)

			return
		}
		// If the map is not empty

		let albumArts = $albumArtMapStore.get(hash($selectedAlbumDir))

		if (albumArts === undefined) {
			loadArt(undefined, undefined)
			return
		}

		// Gets all the available sizes.
		let artSizes = albumArts.map(albumArt => Number(albumArt.artSize))

		// Gets the max size available at the time.
		let maxArtSize = Math.max(...artSizes)

		// Gets the album art with the max size.
		let maxSizeAlbumArt = albumArts.find(albumArt => Number(albumArt.artSize) === maxArtSize)

		loadArt(maxSizeAlbumArt.artPath, maxSizeAlbumArt.artType)
	}

	function filterNumbersFromArray(array: any[]): number[] {
		return array.map(item => Number(item)).filter(item => !isNaN(item))
	}

	let backgroundTransitionDebounce = undefined

	// Takes a file path and loads it to the bg image style property.
	function loadArt(artPath, artType) {
		let imageElement: HTMLImageElement = document.querySelector('song-list-background-svlt img')
		let videoElement: HTMLVideoElement = document.querySelector('song-list-background-svlt video')

		if (!imageElement && !videoElement) {
			return
		}

		if (artPath && artType) {
			imageElement.style.opacity = '0'
			videoElement.style.opacity = '0'

			clearTimeout(backgroundTransitionDebounce)

			backgroundTransitionDebounce = setTimeout(() => {
				if (artType === 'image') {
					imageElement.setAttribute('src', artPath)
					imageElement.style.opacity = '1'
				} else if (artType === 'video') {
					videoElement.setAttribute('src', artPath)
					videoElement.style.opacity = '1'
				}
			}, 300)
		} else {
			imageElement.style.opacity = '0'
			videoElement.style.opacity = '0'
		}
	}

	onMount(() => {
		setArt()
	})
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
		object-fit: fill;
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
</style>
