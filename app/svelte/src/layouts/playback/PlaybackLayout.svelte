<script lang="ts">
	import cssVariablesService from '../../services/cssVariables.service'

	import { playbackStore, playingSongStore } from '../../stores/main.store'
	import traduceFn from '../../functions/traduce.fn'
	import sortSongsArrayFn from '../../functions/sortSongsArray.fn'
	import { config } from '../../stores/config.store'
	import getDirectoryFn from '../../functions/getDirectory.fn'
	import CaretIcon from '../../icons/CaretIcon.svelte'
	import type { SongType } from '../../../../types/song.type'
	import { songToPlayUrlStore } from '../../stores/player.store'
	import PlayButton from '../components/PlayButton.svelte'
  import limitCharactersFn from '../../functions/limitCharacters.fn'

	$: if ($playbackStore.length > 0) {
	}

	let tempTags = ['Track', 'Title', 'SampleRate', 'Album']
	let tagToSortBy = localStorage.getItem('PlaybackTagToSortBy') || $config.userOptions.sortBy
	let tagToSortByOrder = (localStorage.getItem('PlaybackTagToSortByOrder') as 'asc' | 'desc') || $config.userOptions.sortOrder

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

	function sortSongList(tag: string) {
		if (tag === tagToSortBy) {
			tagToSortByOrder = tagToSortByOrder === 'asc' ? 'desc' : 'asc'
		} else {
			tagToSortBy = tag
			tagToSortByOrder = 'asc'
		}

		if (tag === 'Reset') {
			//TODO, add a user customized album sorting
			$playbackStore = sortSongsArrayFn($playbackStore, $config.userOptions.sortBy, $config.userOptions.sortOrder).sort(
				(a, b) => getDirectoryFn(a.SourceFile).localeCompare(getDirectoryFn(b.SourceFile))
			)

			tagToSortBy = $config.userOptions.sortBy
			tagToSortByOrder = $config.userOptions.sortOrder
		} else {
			$playbackStore = sortSongsArrayFn($playbackStore, tagToSortBy, tagToSortByOrder)
		}

		localStorage.setItem('PlaybackTagToSortBy', tagToSortBy)
		localStorage.setItem('PlaybackTagToSortByOrder', tagToSortByOrder)
	}

	function playDoubleClickedSong(song: SongType) {
		$songToPlayUrlStore = [song.SourceFile, { playNow: true }]
	}
</script>

<playback-layout>
	<song-list-grid>
		<tag-row>
			{#each tempTags as tag, index (index)}
				<song-tag
					data-tag={tag}
					data-selected={tag === tagToSortBy}
					data-sort-order={tagToSortByOrder}
					on:click={() => sortSongList(tag)}
					on:keypress={() => sortSongList(tag)}
					tabindex="-1"
					role="button"
					>{renameTagName(tag)}

					<icon-container>
						<CaretIcon
							style="fill: currentColor;height: 1rem; width: 1rem;transform: rotateZ({tagToSortByOrder === 'asc'
								? '0'
								: '180'}deg);"
						/>
					</icon-container>
				</song-tag>
			{/each}
			<reset-sort on:click={() => sortSongList('Reset')} on:keypress={() => sortSongList('index')} tabindex="-1" role="button"
				>Reset Sort</reset-sort
			>
		</tag-row>

		{#each $playbackStore || [] as song, index (index)}
			<song-row on:dblclick={() => playDoubleClickedSong(song)}>
				{#each tempTags as tag, index (index)}
					<song-data data-tag={tag}>
						{#if $playingSongStore.ID === song.ID && index === 0}
							<PlayButton customSize="0.75rem" customMargins="0 0.5rem 0 0" customColor="currentColor"/>
						{/if}

						{limitCharactersFn(song[tag], 75)}
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

	song-tag icon-container {
		transition: opacity 300ms linear;
	}

	song-tag[data-selected='true'] icon-container {
		opacity: 1;
	}

	song-tag[data-selected='false'] icon-container {
		opacity: 0;
	}

	song-row song-data {
		padding: 0.5rem 0.75rem;
		text-align: center;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
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
