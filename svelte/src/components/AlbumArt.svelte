<script lang="ts">
	import { onMount } from 'svelte'
	import { addIntersectionObserver } from '../functions/intersectionObserver.fn'
	import { getArtIPC } from '../services/ipc.service'

	export let style
	export let id
	export let albumId
	export let observe = false

	let dataLoaded = false

	let artType = 'image'
	let element: HTMLElement = undefined

	$: verifyAlbumId(albumId)

	onMount(() => {
		element = document.querySelector(`#${CSS.escape(id)}`) as HTMLElement

		let artSize = Number(getComputedStyle(element).getPropertyValue('height').replace('px', ''))

		element.setAttribute('data-album-id', albumId)

		if (observe === true) {
			addIntersectionObserver(albumId, id, artSize)
		} else {
			getArtIPC(albumId, artSize, id)
		}
	})

	// If the element albumId mismatches the component albumId, then get new cover.
	function verifyAlbumId(newAlbumId: string) {
		if (element !== undefined && element.dataset.albumid !== newAlbumId) {
			let artSize = Number(getComputedStyle(element).getPropertyValue('height').replace('px', ''))

			element.setAttribute('data-album-id', newAlbumId)

			getArtIPC(albumId, artSize, element.id)
		}
	}
</script>

<art-svlt {id} {style} data-type={artType} data-loaded={dataLoaded}>
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
