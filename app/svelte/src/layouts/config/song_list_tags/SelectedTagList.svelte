<script lang="ts">
	import SelectedTag from './SelectedTag.svelte'

	import SortableService from '../../../services/sortable.service'
	import { onMount } from 'svelte'
	import { songListTagConfig } from '../../../stores/config.store'
	import type { ConfigType } from '../../../../../types/config.type'
	import updateConfigFn from '../../../functions/updateConfig.fn'

	$: if ($songListTagConfig.length > 0) createSortableList()

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

		let newTags: ConfigType['songListTags'] = []

		ulElement.querySelectorAll('li').forEach(liElement => {
			newTags.push({
				value: liElement.dataset.value,
				width: 100
			})
		})

		// $songListTagConfig = [...newTags]

		updateConfigFn({
			songListTags: [...newTags]
		})
	}

	onMount(() => {
		createSortableList()
	})
</script>

<selected-tags-list>
	<ul id="items">
		{#each $songListTagConfig as tag, index (`${tag.value}${index}`)}
			<SelectedTag {tag} {index} />
		{/each}
	</ul>
</selected-tags-list>

<style>
	selected-tags-list {
		display: block;
		margin: 0 auto;
		width: var(--clamp-width);
	}
</style>
