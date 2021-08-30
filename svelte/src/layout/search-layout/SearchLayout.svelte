<script lang="ts">
	import CoverArt from '../../components/CoverArt.svelte'
import SongListItem from '../../components/SongListItem.svelte';

	import { hash } from '../../functions/hashString.fn'
	import scrollToAlbumFn from '../../functions/scrollToAlbum.fn'

	import { userSearchIPC } from '../../service/ipc.service'

	import {
		layoutToShow,
		playingSongStore,
		selectedAlbumId,
		selectedSongsStore,
		triggerGroupingChangeEvent,
		triggerScrollToSongEvent
	} from '../../store/final.store'
	import type { SongFuzzySearchType, SongType } from '../../types/song.type'

	let debounce: NodeJS.Timeout = undefined

	let searchString = 'rute'
	let foundSongs: SongFuzzySearchType[] = []

	$: {
		userTypingHandler(searchString)
	}

	function userTypingHandler(searchString: string) {
		clearTimeout(debounce)
		debounce = setTimeout(() => {
		userSearchIPC(searchString, ['Title', 'Composer']).then(result => {
			foundSongs = result
		})
		}, 500)
	}

	function selectSong(selectedSong: SongFuzzySearchType) {
		let song = selectedSong.item

		let albumID = hash(song.SourceFile.split('/').slice(0, -1).join('/'), 'text') as string

		$selectedAlbumId = albumID
		$selectedSongsStore = [song.ID]
		$playingSongStore = song

		$triggerGroupingChangeEvent = String(song[localStorage.getItem('GroupBy')])

		$triggerScrollToSongEvent = true
		$layoutToShow = 'Main'

		setTimeout(() => {
			scrollToAlbumFn(albumID)
		}, 100)
	}

	function getRootDir(value){
		return value.split('/').slice(0, -1).join('/')
	}
</script>

<search-layout class="layout" style="display:{$layoutToShow === 'Search' ? 'block' : 'none'}">
	<input type="text" bind:value={searchString} />
	<search-grid>
		<grid-row>
			<grid-value/>
			<grid-value>Title</grid-value>
			<grid-value>Album</grid-value>
			<grid-value>Album Artist</grid-value>
			<grid-value>Artist</grid-value>
			<grid-value>Composer</grid-value>
		</grid-row>
		{#each foundSongs as song, index (index)}
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
		grid-template-rows: max-content max-content;
		display: grid;
		overflow: auto;
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
		margin: .25rem 0;
	}

	grid-row:first-child {
		cursor: default;
		height: max-content;
	}

	search-grid grid-row grid-value {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
