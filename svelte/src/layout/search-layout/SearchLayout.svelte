<script lang="ts">
	import { onMount } from 'svelte'

	import CoverArt from '../../components/CoverArt.svelte'
	import SongListItem from '../../components/SongListItem.svelte'
	import generateId from '../../functions/generateId.fn'

	import { hash } from '../../functions/hashString.fn'
	import scrollToAlbumFn from '../../functions/scrollToAlbum.fn'

	import { userSearchIPC } from '../../service/ipc.service'

	import {
		elementMap,
		layoutToShow,
		selectedAlbumId,
		selectedSongsStore,
		triggerGroupingChangeEvent,
		triggerScrollToSongEvent
	} from '../../store/final.store'

	import type { SongFuzzySearchType } from '../../types/song.type'

	let searchString = Math.random().toString(36).substring(8)
	let foundSongs: SongFuzzySearchType[] = []

	const filterOptions = ['Title', 'Album', 'Album Artist', 'Artist', 'Composer']
	let selectedFilters = ['Title']

	$: {
		if (selectedFilters.length === 0) {
			selectedFilters = ['Title']
		}
	}

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
	<p>Press Enter or Search Button to search</p>
	<search-input>
		<input type="text" bind:value={searchString} />
		<img src="./img/search.svg" alt="" on:click={() => sendSearchString()} />
	</search-input>
	<filter-selector>
		{#each filterOptions as filter, index (index)}
			<filter-check selected={selectedFilters.includes(filter)}>
				<input id="filter-check-{filter}" type="checkbox" bind:group={selectedFilters} value={filter} />
				<label for="filter-check-{filter}">{filter}</label>
			</filter-check>
		{/each}
	</filter-selector>
	<search-grid>
		<grid-row>
			<!-- ↓ Album Cover ↓ -->
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
					<CoverArt
						klass="Search"
						rootDir={getRootDir(song.item.SourceFile)}
						style="height:40px;width:40px;"
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
		grid-template-rows: repeat(4, max-content);
		display: grid;
		overflow: auto;
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
		height: 1.75rem;
		display: flex;
	}

	filter-selector filter-check input {
		display: none;
	}
	filter-selector filter-check label {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		color: #fff;
		height: 1.75rem;
		/* line-height: 1.75rem; */
	}

	filter-selector filter-check::after {
		display: inline-block;
		height: 1.75rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
			sans-serif;
		border-radius: 0 3px 3px 0;
		filter: brightness(1.25);
		padding: 0 0.5rem;
		line-height: 1.75rem;
	}

	filter-selector filter-check[selected='true'] {
		background-color: forestgreen;
	}

	filter-selector filter-check[selected='true']::after {
		background-color: forestgreen;
		content: '✓';
	}
	filter-selector filter-check[selected='false'] {
		background-color: crimson;
	}

	filter-selector filter-check[selected='false']::after {
		background-color: crimson;
		content: '✕';
	}

	search-grid {
		display: grid;
	}

	search-grid grid-row {
		display: grid;
		grid-template-columns: 40px repeat(5, 1fr);
		height: 40px;
		cursor: pointer;
		align-items: center;
		margin: 0.25rem 0;
	}

	grid-row:first-child {
		cursor: default;
		height: max-content;
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}

	search-grid grid-row grid-value {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
