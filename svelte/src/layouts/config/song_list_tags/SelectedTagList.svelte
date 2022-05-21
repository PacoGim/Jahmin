<script lang="ts">
	import getClosestElementFn from '../../../functions/getClosestElement.fn'
	import swapArrayElementsFn from '../../../functions/swapArrayElements.fn'
	import { songListTagsConfig } from '../../../store/config.store'
	import SelectedTag from './SelectedTag.svelte'

	let draggingElement: HTMLElement = undefined

	function onDragStart(e) {
		let detail: DragEvent = e.detail

		// When an element gets dragged, it changes the state of the current dragged element.
		draggingElement = detail.target as HTMLElement
	}

	function onDragDrop(e) {
		let detail: DragEvent = e.detail || e

		let targetElement = getClosestElementFn(detail.target as HTMLElement, 'selected-tag-component')

		if (draggingElement === undefined || targetElement === undefined) return

		let draggedElementPosition = draggingElement.getBoundingClientRect()
		let targetElementPosition = targetElement.getBoundingClientRect()

		draggingElement.classList.add('slow-transition')
		targetElement.classList.add('slow-transition')

		// Swap positions with both elements
		draggingElement.style.transform = `translate(${targetElementPosition.left - draggedElementPosition.left}px, ${
			targetElementPosition.top - draggedElementPosition.top
		}px)`

		targetElement.style.transform = `translate(${draggedElementPosition.left - targetElementPosition.left}px, ${
			draggedElementPosition.top - targetElementPosition.top
		}px)`

		setTimeout(() => {
			draggingElement.classList.remove('slow-transition')
			targetElement.classList.remove('slow-transition')

			draggingElement.style.transform = `translate(0, 0)`
			targetElement.style.transform = `translate(0, 0)`

			$songListTagsConfig = swapArrayElementsFn(
				$songListTagsConfig,
				+draggingElement.dataset.index,
				+targetElement.dataset.index
			)

			draggingElement = undefined
		}, 500)
	}
</script>

<selected-tags-list>
	{#each $songListTagsConfig as tag, index (index)}
		{#if tag.value !== 'DynamicArtists'}
			<SelectedTag on:dragStart={onDragStart} on:dragDrop={onDragDrop} {tag} {index} />
		{/if}
	{/each}
</selected-tags-list>

<style>
	selected-tags-list {
		display: block;
		width: var(--clamp-width);
	}
</style>
