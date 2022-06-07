<script lang="ts">
	import { songListTagsConfig } from '../../../store/config.store'
	import SelectedTag from './SelectedTag.svelte'

	import SortableService from '../../../services/sortable.service'
	import { onMount } from 'svelte'

	$: if ($songListTagsConfig.length > 0) createSortableList()

	function createSortableList() {
		let el = document.querySelector('selected-tags-list ul')

		if (el === undefined || el === null) return

		SortableService.create(el, {
			animation: 150,
			selectedClass: null,
			onEnd: onDragEnd
		})
	}

	function onDragEnd(evt) {
		let ulElement = document.querySelector('selected-tags-list ul')

		if (ulElement === undefined || ulElement === null) return

		let newTags = []

		ulElement.querySelectorAll('li').forEach(liElement => {
			newTags.push({
				align: liElement.dataset.align,
				value: liElement.dataset.value,
				isExpanded: liElement.dataset.isExpanded === 'true'
			})
		})

		$songListTagsConfig = newTags
	}

	onMount(() => {
		createSortableList()
	})
</script>

<selected-tags-list>
	<ul id="items">
		{#each $songListTagsConfig as tag, index (`${tag.value}${index}`)}
			<SelectedTag {tag} {index} />
		{/each}
	</ul>
</selected-tags-list>

<style>
	selected-tags-list {
		display: block;
		width: var(--clamp-width);
	}
</style>
