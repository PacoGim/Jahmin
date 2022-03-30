<script lang="ts">
	import { onMount } from 'svelte'
	import { addIntersectionObserver } from '../functions/intersectionObserver.fn'
	import setArtToSrcFn from '../functions/setArtToSrc.fn'
	import { compressAlbumArt } from '../services/ipc.service'
	import { artSizeConfig, songAmountConfig } from '../store/config.store'
	import { albumArtMapStore } from '../store/final.store'

	export let style
	export let albumId
	export let observer: 'addObserver' | '!addObserver' = '!addObserver'

	let dataLoaded = false

	let artVersion = 0

	export let artSize = undefined

	let artType = 'image'
	let element: HTMLElement = undefined

	let isFirstAssing = true

	$: verifyAlbumId(albumId)
	/*
	$: {
		$albumArtMapStore
		checkIfNewImage()
	}

	function checkIfNewImage() {
		let albumArtData = $albumArtMapStore.get(albumId)

		if (albumArtData === undefined) {
			return
		}

		if (isFirstAssing) {
			isFirstAssing = false
			artVersion = albumArtData.version
			return
		}

		if (albumArtData?.version > artVersion) {
			console.log(albumArtData)
			// console.log(albumArtData?.version, artVersion)
			// setArtToSrcFn(albumArtData.art, element)
		}

		// console.log('checkIfNewImage',albumId)
	}
 */

	onMount(() => {
		// element = document.querySelector(`#${CSS.escape(id)}`) as HTMLElement
		// artSize = Number(getComputedStyle(element).getPropertyValue('height').replace('px', ''))
		// element.setAttribute('data-album-id', albumId)
		// if (observer === 'addObserver') {
		// 	addIntersectionObserver(albumId, artSize)
		// } else {
		// 	getArtIPC(albumId, artSize)
		// }
	})

	$: handleAlbumArt(albumId, artSize)

	function handleAlbumArt(albumId, artSize) {
		if (albumId === undefined || artSize === 0) {
			return
		}

		if (observer === 'addObserver') {
			addIntersectionObserver(element, albumId, artSize)
		} else {
			// console.log('Not observing', albumId, artSize)
			// getArtIPC(albumId, artSize)
		}

		// console.log('foo', albumId, artSize)
	}

	// If the element albumId mismatches the component albumId, then get new cover.
	function verifyAlbumId(newAlbumId: string) {
		if (element !== undefined && element.dataset.albumid !== newAlbumId) {
			let artSize = Number(getComputedStyle(element).getPropertyValue('height').replace('px', ''))

			element.setAttribute('data-album-id', newAlbumId)

			// getArtIPC(newAlbumId, artSize, element.id)
			// getArtIPC(newAlbumId, artSize)
		}
	}
</script>

<art-svlt
	data-albumId={albumId}
	data-artSize={artSize}
	data-type={artType}
	data-loaded={dataLoaded}
	bind:this={element}
	{style}
>
	<img alt="" />

	<video autoplay loop>
		<track kind="captions" />
		<source />
	</video>
</art-svlt>

<style>
	art-svlt {
		cursor: default;
		grid-column: 1;
		grid-row: 1;
		display: block;

		transform: scale(0);

		transition: transform 300ms cubic-bezier(0.5, 0.5, 0.265, 1.5);
	}

	art-svlt[data-type='unfound'] video,
	art-svlt[data-type='image'] video {
		display: none;
	}

	art-svlt[data-type='video'] img {
		display: none;
	}

	body[theme='Dark'] art-svlt[data-type='unfound'] img {
		filter: invert(1);
	}

	art-svlt[data-loaded='true'] {
		transform: scale(1);
	}

	art-svlt[data-loaded='false'] {
		transform: scale(0);
	}

	art-svlt > * {
		height: 100%;
	}
</style>
