<script lang="ts">
	import SelectedTag from './SelectedTag.svelte'

	import SortableService from '../../../services/sortable.service'
	import { onMount } from 'svelte'
	import { config } from '../../../stores/main.store'

	$: if ($config.songListTags.length > 0) createSortableList()

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

		$config.songListTags = newTags
	}

	onMount(() => {
		createSortableList()
	})
</script>

<selected-tags-list>
	<ul id="items">
		{#each $config.songListTags as tag, index (`${tag.value}${index}`)}
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
