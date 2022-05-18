<script lang="ts">
	import { selectedTagsStore } from '../../../store/final.store'
	import type { PartialSongType } from '../../../types/song.type'
	import SelectedTag from './SelectedTag.svelte'

	let optionBind

	let possibleTags = [
		{ value: 'Album', name: 'Album' },
		{ value: 'AlbumArtist', name: 'Album Artist' },
		{ value: 'Artist', name: 'Artist' },
		{ value: 'BitRate', name: 'Bit Rate' },
		{ value: 'Comment', name: 'Comment' },
		{ value: 'Composer', name: 'Composer' },
		{ value: 'Date_Day', name: 'Date Day' },
		{ value: 'Date_Month', name: 'Date Month' },
		{ value: 'Date_Year', name: 'Date Year' },
		{ value: 'DiscNumber', name: 'Disc Number' },
		{ value: 'Duration', name: 'Duration' },
		{ value: 'Extension', name: 'Extension' },
		{ value: 'Genre', name: 'Genre' },
		{ value: 'ID', name: 'ID' },
		{ value: 'Rating', name: 'Rating' },
		{ value: 'SampleRate', name: 'Sample Rate' },
		{ value: 'Size', name: 'Size' },
		{ value: 'Title', name: 'Title' },
		{ value: 'Track', name: 'Track' }
	]

	let sampleSong: PartialSongType = {
		Album: 'Nightchild',
		AlbumArtist: 'Jokabi',
		Artist: 'Jokabi',
		BitRate: 172.5405714285714,
		Comment: 'This is a comment',
		Composer: 'Jokabi',
		Date_Day: 13,
		Date_Month: 12,
		Date_Year: 2019,
		DiscNumber: 1,
		Duration: 126,
		Extension: 'opus',
		Genre: 'Lo-fi',
		ID: 459990,
		LastModified: 1649180406000,
		Rating: 4,
		SampleRate: 48000,
		Size: 2738235,
		Title: 'Forest',
		Track: 1
	}

	let draggedElement = undefined
	let draggedElementTarget = undefined

	function addTag() {
		console.log(optionBind)
	}

	function onDragEnter(e) {
		let detail: DragEvent = e.detail || e

		let validElement: HTMLElement = detail.composedPath().find((element: HTMLElement) => {
			if (['SELECTED-TAG-COMPONENT'].includes(element.tagName)) {
				return true
			} else {
				return false
			}
		}) as HTMLElement

		if (validElement) {
			draggedElementTarget = validElement
		}
	}

	function onDragEnd(e) {
		if (draggedElement && draggedElementTarget) {
			// console.log(draggedElement, draggedElementTarget)

			let draggedElementPosition = draggedElement.getBoundingClientRect()
			let targetElementPosition = draggedElementTarget.getBoundingClientRect()

			draggedElement.style.transform = `translate(${targetElementPosition.left - draggedElementPosition.left}px, ${
				targetElementPosition.top - draggedElementPosition.top
			}px)`

			draggedElementTarget.style.transform = `translate(${draggedElementPosition.left - targetElementPosition.left}px, ${
				draggedElementPosition.top - targetElementPosition.top
			}px)`

			setTimeout(() => {
				$selectedTagsStore = swapArrayElements(
					$selectedTagsStore,
					draggedElement.dataset.index,
					draggedElementTarget.dataset.index
				)

				draggedElement.style.transition = 'none'
				draggedElement.style.transform = ''
				draggedElementTarget.style.transition = 'none'
				draggedElementTarget.style.transform = ''

				setTimeout(() => {
					draggedElementTarget.style.transition = 'transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);'
					draggedElement.style.transition = 'transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);'
				}, 1)

				// draggedElement = undefined
				// draggedElementTarget = undefined
			}, 500)

			return
		}
	}

	function swapArrayElements(array: any[], indexA: number, indexB: number) {
		let temp = array[indexA]
		array[indexA] = array[indexB]
		array[indexB] = temp

		return array
	}

	function onDragStart(e) {
		let detail: DragEvent = e.detail || e

		draggedElement = detail.target
	}
</script>

<song-list-config>
	<song-list-tags>
		<select bind:value={optionBind}>
			{#each possibleTags as tag, index (index)}
				<option value={tag.value}>{tag.name}</option>
			{/each}
		</select>
		<p on:click={() => addTag()}>+</p>

		<br />

		<selected-tags-list>
			{#each $selectedTagsStore as tag, index (index)}
				<SelectedTag
					on:dragEnter={onDragEnter}
					on:dragEnd={onDragEnd}
					on:dragStart={onDragStart}
					{tag}
					{index}
					{possibleTags}
				/>
			{/each}
		</selected-tags-list>

		<br />
		<br />
		<br />

		{#each $selectedTagsStore as tag, index (index)}
			<p>
				{sampleSong[tag.value]}
			</p>
		{/each}
	</song-list-tags>
</song-list-config>

<style>
	song-list-config {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	selected-tags-list {
		display: block;
		width: var(--clamp-width);
	}
</style>
