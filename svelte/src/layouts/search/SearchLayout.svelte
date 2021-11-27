<script lang="ts">
	import { onMount } from 'svelte'

	import AlbumArt from '../../components/AlbumArt.svelte'
	import generateId from '../../functions/generateId.fn'

	import { hash } from '../../functions/hashString.fn'
	import scrollToAlbumFn from '../../functions/scrollToAlbum.fn'

	import { userSearchIPC } from '../../services/ipc.service'

	import {
		elementMap,
		layoutToShow,
		selectedAlbumId,
		selectedSongsStore,
		triggerGroupingChangeEvent,
		triggerScrollToSongEvent
	} from '../../store/final.store'

	import type { SongFuzzySearchType } from '../../types/song.type'

	let searchString = ''
	let foundSongs: SongFuzzySearchType[] = []

	const filterOptions = ['Title', 'Album', 'Album Artist', 'Artist', 'Composer']
	let selectedFilters = ['Title']

	$: if (selectedFilters.length === 0) selectedFilters = ['Title']

	function sendSearchString() {
		userSearchIPC(searchString, selectedFilters).then(result => {
			foundSongs = result
		})
	}

	function selectSong(selectedSong: SongFuzzySearchType) {
		let song = selectedSong.item

		let albumID = hash(song.SourceFile.split('/').slice(0, -1).join('/'), 'text') as string

		$selectedAlbumId = albumID
		$selectedSongsStore = [song.ID]

		$triggerGroupingChangeEvent = String(song[localStorage.getItem('GroupBy')])

		$layoutToShow = 'Main'

		setTimeout(() => {
			scrollToAlbumFn(albumID)
			$triggerScrollToSongEvent = song.ID
		}, 100)
	}

	function getRootDir(value) {
		return value.split('/').slice(0, -1).join('/')
	}

	function toggleFilter(filterName: string) {
		if (selectedFilters.includes(filterName)) {
			selectedFilters = selectedFilters.filter(n => n !== filterName)
		} else {
			selectedFilters.push(filterName)
			selectedFilters = selectedFilters
		}
	}

	onMount(() => {
		sendSearchString()
		window.addEventListener('keypress', ({ code }) => {
			if (elementMap && $elementMap.get('SEARCH-LAYOUT') !== undefined && code === 'Enter') {
				sendSearchString()
			}
		})
	})
</script>

<search-layout class="layout" style="display:{$layoutToShow === 'Search' ? 'grid' : 'none'}">
	<h1>Search Song</h1>
	<p>Press Enter or Search Button to search</p>
	<search-input>
		<input type="text" bind:value={searchString} />
		<img src="./img/search.svg" alt="" on:click={() => sendSearchString()} />
	</search-input>
	<filter-selector>
		{#each filterOptions as filter, index (index)}
			<filter-check selected={selectedFilters.includes(filter)} on:click={() => toggleFilter(filter)}>
				<input id="filter-check-{filter}" type="checkbox" bind:group={selectedFilters} value={filter} />
				<span>{filter}</span>
				<input-icon>{selectedFilters.includes(filter) ? '✓' : '✕'}</input-icon>
			</filter-check>
		{/each}
	</filter-selector>
	<search-grid>
		<grid-row>
			<!-- ↓ Album Art ↓ -->
			<grid-value />
			<grid-value>Title</grid-value>
			<grid-value>Album</grid-value>
			<grid-value>Album Artist</grid-value>
			<grid-value>Artist</grid-value>
			<grid-value>Composer</grid-value>
		</grid-row>
		{#each foundSongs as song (generateId())}
			<grid-row
				on:click={() => {
					selectSong(song)
				}}
			>
				<grid-value>
					<AlbumArt
						klass="Search"
						rootDir={getRootDir(song.item.SourceFile)}
						style="height:3rem;width:3rem;cursor:pointer;"
						type="forceLoad"
						showPlaceholder={false}
					/>
				</grid-value>
				<grid-value>{song.item.Title}</grid-value>
				<grid-value>{song.item.Album}</grid-value>
				<grid-value>{song.item.AlbumArtist}</grid-value>
				<grid-value>{song.item.Artist}</grid-value>
				<grid-value>{song.item.Composer}</grid-value>
			</grid-row>
		{/each}
	</search-grid>
</search-layout>

<style>
	search-layout {
		grid-template-columns: auto;
		grid-template-rows: repeat(5, max-content);
		row-gap: 1rem;
		display: grid;
		overflow: auto;
	}

	search-layout h1 {
		padding-top: 1rem;
		width: 100%;
		text-align: center;
	}

	search-layout p {
		text-align: center;
	}

	search-input {
		display: flex;
		justify-content: center;
		height: 3rem;
	}

	search-input input {
		font-family: inherit;
		font-size: inherit;
		padding: 0 1rem;
		text-align: center;
		color: var(--primary-color);
		background-color: rgba(128, 128, 128, 0.1);
		border-radius: 3px 0 0 3px;
		border: none;
	}

	search-input img {
		cursor: pointer;
		height: 100%;
		background-color: rgba(128, 128, 128, 0.1);
		border-radius: 0 3px 3px 0;
		filter: invert(98%) sepia(99%) saturate(124%) hue-rotate(324deg) brightness(95%) contrast(93%);
	}

	filter-selector {
		display: flex;
		justify-content: center;
	}

	filter-selector filter-check {
		margin: 0 0.5rem;
		border-radius: 3px;
		height: 1.5rem;
		display: flex;
		font-size: 0.9rem;
		align-items: center;
		padding-left: 0.5rem;
		cursor: pointer;
	}

	filter-selector filter-check input {
		display: none;
	}
	filter-selector filter-check span {
		display: inline-block;
		color: #fff;
	}
	filter-selector filter-check input-icon {
		/* height: 1.5rem; */
		width: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	filter-selector filter-check[selected='true'] {
		background-color: forestgreen;
	}

	filter-selector filter-check[selected='false'] {
		background-color: #dc143c;
	}

	search-grid {
		display: grid;
	}

	search-grid grid-row {
		display: grid;
		grid-template-columns: 3rem repeat(5, 1fr);
		cursor: pointer;
		align-items: center;
		column-gap: 1rem;
	}
	grid-row:first-child {
		height: 3rem;
		cursor: default;
		/* height: max-content; */
		font-variation-settings: 'wght' calc(var(--default-weight) + 25);

		background-color: rgba(128, 128, 128, 0.3);
	}

	search-grid grid-row:not(:first-child) {
		transition: filter 150ms ease-in-out;
	}
	search-grid grid-row:not(:first-child):hover {
		filter: brightness(1.25);
	}

	grid-row:nth-child(odd) {
		background-color: rgba(128, 128, 128, 0.2);
	}

	grid-row:nth-child(even) {
		background-color: rgba(128, 128, 128, 0.1);
	}

	search-grid grid-row grid-value {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
