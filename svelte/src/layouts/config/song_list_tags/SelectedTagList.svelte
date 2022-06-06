<script lang="ts">
	import { songListTagsConfig } from '../../../store/config.store'
	import SelectedTag from './SelectedTag.svelte'

	import { Sortable } from 'sortablejs'
	import { onMount } from 'svelte'
	import { saveConfig } from '../../../services/ipc.service'

	$: if ($songListTagsConfig.length > 0) createSortableList()

	$: {
		console.log($songListTagsConfig)
	}

	function createSortableList() {
		let el = document.querySelector('selected-tags-list ul')

		if (el === undefined || el === null) return

		let sortable = Sortable.create(el, {
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
</script>

<selected-tags-list>
	<ul id="items">
		{#each $songListTagsConfig as tag, index (`${tag.value}${index}`)}
			{#if tag.value !== 'DynamicArtists'}
				<SelectedTag {tag} {index} />
			{/if}
		{/each}
	</ul>
</selected-tags-list>

<style>
	selected-tags-list {
		display: block;
		width: var(--clamp-width);
	}
</style>
