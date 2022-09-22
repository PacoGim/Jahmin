<script lang="ts">
	import calculateElementArtSizeFn from '../functions/calculateElementArtSize.fn'
	import generateId from '../functions/generateId.fn'

	import intersectionObserverFn from '../functions/intersectionObserver.fn'
	import { reloadArts } from '../stores/main.store'

	export let intersectionRoot = undefined
	export let imageSourceLocation = ''

	let elementId = ''
	let element: HTMLElement = undefined
	let elementWidth = 0
	let elementHeight = 0

	$: {
		imageSourceLocation
		elementId = generateId()
	}

	$: {
		if (element !== undefined) {
			let { height, width } = calculateElementArtSizeFn(element.parentElement, { keepSquare: true })
			elementHeight = height
			elementWidth = width

			if (imageSourceLocation) {
				loadArt(imageSourceLocation, elementId, intersectionRoot, elementHeight, elementWidth)
			}
		}
	}

	function loadArt(artPath, elementId, intersectionRoot, height, width) {
		let size = height || width

		if (intersectionRoot !== undefined) {
			intersectionObserverFn(elementId, intersectionRoot).then(() => {
				window.ipc.handleArt(artPath, elementId, size)
			})
		} else {
			window.ipc.handleArt(artPath, elementId, size)
		}
	}
</script>

{#key $reloadArts}
	<art-svlt id={elementId} bind:this={element} style="height:{elementHeight}px;width:{elementWidth}px;" />
{/key}

<style>
	art-svlt {
		cursor: default;
		grid-column: 1;
		grid-row: 1;
		display: block;

		background-image: url('../assets/img/disc-line.svg');
		background-size: cover;

		background-color: hsla(0, 0%, 50%, 0.5);
	}

	:global(art-svlt img, art-svlt video) {
		object-fit: fill;
		width: 100%;
		height: 100%;
	}

	:global(art-svlt art-animation) {
		display: block;
		width: 100%;
		height: 100%;
		position: relative;
	}

	:global(art-svlt art-animation img) {
		position: absolute;
	}

	art-svlt:has(*) {
		background-color: hsla(0, 0%, 50%, 0);
		background-image: none;
	}
</style>
