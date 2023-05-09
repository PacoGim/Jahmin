<script lang="ts">
	import cssVariablesService from '../../services/cssVariables.service'

	import { playbackStore, playingSongStore } from '../../stores/main.store'
	import traduceFn from '../../functions/traduce.fn'
	import sortSongsArrayFn from '../../functions/sortSongsArray.fn'
	import { config } from '../../stores/config.store'
	import getDirectoryFn from '../../functions/getDirectory.fn'

	$: if ($playbackStore.length > 0) {
	}

	let tempTags = ['Track', 'Title', 'SampleRate', 'Album']

	$: {
		cssVariablesService.set('temp-tags-qt', tempTags.length)
	}

	function renameTagName(tagName) {
		let renamed =
			{
				Track: '#',
				SampleRate: 'Sample Rate'
			}[tagName] || tagName

		return traduceFn(renamed)
	}

	function limitCharacters(value: any, maxCharacters: number = 20) {
		value = String(value)

		if (value.length + 3 > maxCharacters) {
			return value.substring(0, maxCharacters) + '...'
		} else {
			return value
		}
	}

	function sortSongList(tag: string) {
		if (tag === 'Reset') {
			//TODO, add a user customized album sorting
			$playbackStore = sortSongsArrayFn($playbackStore, $config.userOptions.sortBy, $config.userOptions.sortOrder).sort(
				(a, b) => getDirectoryFn(a.SourceFile).localeCompare(getDirectoryFn(b.SourceFile))
			)
		} else {
			$playbackStore = sortSongsArrayFn($playbackStore, tag, 'asc')
		}
	}
</script>

<playback-layout>
	<song-list-grid>
		<tag-row>
			{#each tempTags as tag, index (index)}
				<song-tag
					data-tag={tag}
					on:click={() => sortSongList(tag)}
					on:keypress={() => sortSongList(tag)}
					tabindex="-1"
					role="button">{renameTagName(tag)}</song-tag
				>
			{/each}
			<reset-sort on:click={() => sortSongList('Reset')} on:keypress={() => sortSongList('index')} tabindex="-1" role="button"
				>Reset Sort</reset-sort
			>
		</tag-row>

		{#each $playbackStore || [] as song, index (index)}
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

	tag-row {
		display: contents;
	}

	song-tag {
		text-align: center;
		padding: 0.5rem 0.75rem;
		font-variation-settings: 'wght' 700;
		cursor: pointer;
		background-color: var(--color-bg-2);
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

	reset-sort {
		text-align: center;
		padding: 0.5rem 0.75rem;
		font-variation-settings: 'wght' 700;
		cursor: pointer;
		background-color: var(--color-bg-2);
	}
</style>
