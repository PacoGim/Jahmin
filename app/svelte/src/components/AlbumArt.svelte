<script lang="ts">
	import calculateElementArtSizeFn from '../functions/calculateElementArtSize.fn'
	import generateId from '../functions/generateId.fn'

	import intersectionObserverFn from '../functions/intersectionObserver.fn'

	export let intersectionRoot = undefined
	export let imageSourceLocation = ''

	let elementId = generateId()
	let element: HTMLElement = undefined
	let elementWidth = 0
	let elementHeight = 0

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

<art-svlt id={elementId} bind:this={element} style="height:{elementHeight}px;width:{elementWidth}px;" />

<style>
	art-svlt {
		cursor: default;
		grid-column: 1;
		grid-row: 1;
		display: block;

		background-image: url('../assets/img/disc-line.svg');
		background-color: hsla(0, 0%, 50%, 0.5);

		transition: transform 300ms cubic-bezier(0.5, 0.5, 0.265, 1.5);
	}

	:global(art-svlt > *) {
		width: 100%;
		height: 100%;
	}
</style>
