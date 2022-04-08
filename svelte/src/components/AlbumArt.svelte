<script lang="ts">
	import { onMount } from 'svelte'
	import { hash } from '../functions/hashString.fn'
	import { addIntersectionObserver } from '../functions/intersectionObserver.fn'
	import setArtToSrcFn from '../functions/setArtToSrc.fn'
	import { compressAlbumArtIPC } from '../services/ipc.service'
	import { artSizeConfig, songAmountConfig } from '../store/config.store'
	import { albumArtMapStore } from '../store/final.store'

	export let style
	let albumId
	export let observer: 'addObserver' | '!addObserver' = '!addObserver'
	export let rootDir
	export let artSize = undefined

	let dataLoaded = false

	let artType = 'image'
	let element: HTMLElement = undefined

	onMount(() => {})

	$: handleAlbumArt(rootDir, artSize)

	function handleAlbumArt(rootDir, artSize) {
		if (rootDir === undefined || artSize === 0) {
			return
		}

		albumId = hash(rootDir) as string

		let albumArtData = $albumArtMapStore.get(albumId)?.find(art => art.artSize === artSize)

		if (albumArtData === undefined) {
			if (observer === 'addObserver') {
				addIntersectionObserver(element, rootDir, artSize)
			} else {
				compressAlbumArtIPC(rootDir, artSize, false)
			}

			return
		} else {
			setArtToSrcFn(albumId, albumArtData.artSize, albumArtData.artPath, albumArtData.artType).catch(reason => {
				setTimeout(() => {
					handleAlbumArt(albumId, artSize)
				}, 5)
			})
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
