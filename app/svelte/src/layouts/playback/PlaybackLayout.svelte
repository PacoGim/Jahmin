<script lang="ts">
	import cssVariablesService from '../../services/cssVariables.service'

	import { playbackStore, playingSongStore, windowResize } from '../../stores/main.store'
	import traduceFn from '../../functions/traduce.fn'
	import sortSongsArrayFn from '../../functions/sortSongsArray.fn'
	import { config } from '../../stores/config.store'
	import getDirectoryFn from '../../functions/getDirectory.fn'
	import CaretIcon from '../../icons/CaretIcon.svelte'
	import type { SongType } from '../../../../types/song.type'
	import { songToPlayUrlStore } from '../../stores/player.store'
	import PlayButton from '../components/PlayButton.svelte'
	import { tick } from 'svelte'

	let tempTags = ['Track', 'Title', 'SampleRate', 'Album', 'Rating']
	let tagToSortBy = localStorage.getItem('PlaybackTagToSortBy') || $config.userOptions.songSort.sortBy
	let tagToSortByOrder =
		(localStorage.getItem('PlaybackTagToSortByOrder') as 'asc' | 'desc') || $config.userOptions.songSort.sortOrder

	let scrollAmount = 0
	let songsAmount = 0

	let scrollProgressValue = 0

	$: {
		cssVariablesService.set('temp-tags-qt', tempTags.length)
	}

	$: {
		$windowResize
		calcSongAmount()
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
			// Double sorting???
			$playbackStore = sortSongsArrayFn(
				$playbackStore,
				$config.userOptions.songSort.sortBy,
				$config.userOptions.songSort.sortOrder
			).sort((a, b) => getDirectoryFn(a.SourceFile).localeCompare(getDirectoryFn(b.SourceFile)))

			tagToSortBy = $config.userOptions.songSort.sortBy
			tagToSortByOrder = $config.userOptions.songSort.sortOrder
		} else {
			$playbackStore = sortSongsArrayFn($playbackStore, tagToSortBy, tagToSortByOrder)
		}

		scrollAmount = 0
		localStorage.setItem('PlaybackTagToSortBy', tagToSortBy)
		localStorage.setItem('PlaybackTagToSortByOrder', tagToSortByOrder)
	}

	function playDoubleClickedSong(song: SongType) {
		$songToPlayUrlStore = [song.SourceFile, { playNow: true }]
	}

	function scrollContainer(e: WheelEvent) {
		let newScrollAmount = scrollAmount + Math.sign(e.deltaY)

		if ($playbackStore.length <= songsAmount) {
			scrollAmount = 0
			scrollProgressValue = 0
		} else if (newScrollAmount < 0) {
			scrollAmount = 0
			scrollProgressValue = 0
		} else if (newScrollAmount + songsAmount >= $playbackStore.length) {
			scrollAmount = $playbackStore.length - songsAmount
			scrollProgressValue = 100
		} else {
			scrollAmount = newScrollAmount
			scrollProgressValue = (100 / $playbackStore.length) * scrollAmount
		}
	}

	function calcSongAmount() {
		let currentWindow = document.querySelector('current-window-svlt')

		if (currentWindow === null) {
			tick().then(() => {
				calcSongAmount()
			})
		} else {
			songsAmount = Math.trunc((currentWindow.getClientRects()[0].height - 38) / 38)
		}
	}
</script>

<playback-layout on:mousewheel={scrollContainer}>
	<song-list-grid style={``}>
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

		{#each $playbackStore.slice(scrollAmount, songsAmount + scrollAmount) || [] as song, index (index)}
			<song-row on:dblclick={() => playDoubleClickedSong(song)} role="button" tabindex="0">
				{#each tempTags as tag, index (index)}
					<song-data data-tag={tag}>
						{#if $playingSongStore.ID === song.ID && index === 0}
							<PlayButton customSize="0.75rem" customMargins="0 0.5rem 0 0" customColor="currentColor" />
						{/if}

						{song[tag]}
						<!-- {limitCharactersFn(song[tag], 75)} -->
					</song-data>
				{/each}
				<blank-data />
			</song-row>
		{/each}
	</song-list-grid>

	<go-back-up
		on:click={() => {
			scrollAmount = 0
			scrollProgressValue = 0
		}}
		on:keypress={() => {
			scrollAmount = 0
			scrollProgressValue = 0
		}}
		class:hide={scrollAmount < 10}
		role="button"
		tabindex="0"
	>
		<span>Go back up</span>
		<arrow-up>▲</arrow-up>
	</go-back-up>

	<scroll-area>
		<scroll-progress style={`height:${scrollProgressValue}%;`} />
	</scroll-area>
</playback-layout>

<style>
	scroll-area {
		display: block;
		background-color: rgba(128, 128, 128, 0.5);
		position: absolute;
		height: 100%;
		width: 10px;
		right: 0;
		bottom: 0;
	}

	scroll-area scroll-progress {
		position: absolute;
		background-color: var(--color-accent-1);
		width: 4px;
		margin: 0 3px;

		border-radius: 100vmax;
	}

	playback-layout {
		position: relative;
	}
	song-list-grid {
		display: grid;
		grid-template-columns: repeat(var(--temp-tags-qt), minmax(0px, max-content)) auto;
		grid-template-rows: repeat(auto-fill, 38px);
		height: 100%;
	}

	song-row {
		display: contents;
		cursor: pointer;

		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	song-row > * {
		height: 38px;
	}

	tag-row {
		display: contents;
	}

	song-tag {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.5rem 0.75rem;
		font-variation-settings: 'wght' 700;
		cursor: pointer;
		background-color: var(--color-bg-2);
	}

	song-tag icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		margin-left: 0.25rem;
		transition: opacity 300ms linear;
	}

	song-tag[data-selected='true'] icon-container {
		opacity: 1;
	}

	song-tag[data-selected='false'] icon-container {
		opacity: 0;
		max-width: 0px;
	}

	:global(song-tag[data-selected='false'] icon-container svg) {
		max-width: 0px;
	}

	song-row song-data {
		padding: 0.5rem 0.75rem;
		text-align: center;
		display: block;
		/* flex-direction: row; */
		/* align-items: center; */
		/* justify-content: center; */
		max-width: 300px;

		/* flex: 1; */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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

	go-back-up {
		position: absolute;
		bottom: 20px;
		right: 20px;

		font-size: 0.9rem;

		display: flex;
		align-items: center;
		justify-content: center;

		color: #fff;
		background-color: var(--color-accent-1);

		padding: 0.25rem 0.5rem;
		border-radius: 3px;
		font-variation-settings: 'wght' 700;

		cursor: pointer;

		transition: opacity 300ms ease-in-out;
	}

	go-back-up arrow-up {
		margin-left: 0.25rem;
	}

	go-back-up.hide {
		opacity: 0;
		pointer-events: none;
	}
</style>
