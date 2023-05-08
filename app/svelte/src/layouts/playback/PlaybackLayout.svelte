<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import getClosestElementFn from '../../functions/getClosestElement.fn'
	import cssVariablesService from '../../services/cssVariables.service'

	import { playbackStore, playingSongStore } from '../../stores/main.store'
	import { songToPlayUrlStore } from '../../stores/player.store'
	import PlayButton from '../components/PlayButton.svelte'
	import sortSongsArrayFn from '../../functions/sortSongsArray.fn'
	import { config } from '../../stores/config.store'

	$: if ($playbackStore.length > 0) {
	}

	let selectedSongsId = []

	let tempTags = ['Track', 'Title', 'SampleRate', 'Album']

	$: {
		cssVariablesService.set('temp-tags-qt', tempTags.length)
	}

	function createSortableList() {}

	function renameTagName(tagName) {
		return {
			Track: '#',
			Title: 'Title',
			SampleRate: 'Sample Rate',
			Artist: 'Artist',
			Album: 'Album'
		}[tagName]
	}

	function limitCharacters(value: any, maxCharacters: number = 20) {
		value = String(value)

		if (value.length + 3 > maxCharacters) {
			return value.substring(0, maxCharacters) + '...'
		} else {
			return value
		}
	}

	onMount(() => {
		createSortableList()
	})
</script>

<!-- <scroll-bar> <scroll-bar-progress style="width:{heightPercent}%;" /></scroll-bar> -->

<playback-layout>
	<song-list-grid>
		{#each $playbackStore as song, index (index)}
			<song-row>
				{#each tempTags as tag, index (index)}
					<song-data data-tag={tag}>
						{limitCharacters(song[tag], 75)}
					</song-data>
				{/each}
				<blank-data />
			</song-row>
		{/each}
	</song-list-grid>
</playback-layout>

<style>
	song-list-grid {
		display: grid;
		grid-template-columns: repeat(var(--temp-tags-qt), minmax(0px, max-content)) auto;
	}

	song-row {
		display: contents;
		cursor: pointer;
	}

	song-row song-data {
		padding: 0.5rem 0.75rem;
		text-align: center;
	}

	song-row:nth-child(even) song-data,
	song-row:nth-child(even) blank-data {
		background-color: var(--color-bg-1);
	}

	song-row:nth-child(odd) song-data,
	song-row:nth-child(odd) blank-data {
		background-color: var(--color-bg-2);
	}

	song-row:hover song-data,
	song-row:hover blank-data {
		background-color: var(--color-bg-3);
	}

	song-data[data-tag='Title'] {
	}

	song-row song-data {
		/* max-width: 400px; */
		/* text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap; */
	}
</style>
