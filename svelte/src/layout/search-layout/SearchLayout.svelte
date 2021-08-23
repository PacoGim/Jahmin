<script lang="ts">
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

	let searchString = ''
	let foundSongs: SongFuzzySearchType[] = []

	$: {
		userTypingHandler(searchString)
	}

	function userTypingHandler(searchString: string) {
		clearTimeout(debounce)
		debounce = setTimeout(() => {
			userSearchIPC(searchString).then(result => (foundSongs = result))
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
</script>

<search-layout class="layout" style="display:{$layoutToShow === 'Search' ? 'block' : 'none'}">
	<input type="text" bind:value={searchString} />
	<found-songs>
		{#each foundSongs as song, index (index)}
			<p
				on:click={() => {
					selectSong(song)
				}}
			>
				{song?.item.Title}
			</p>
		{/each}
	</found-songs>
</search-layout>

<style>
	search-layout {
		grid-template-columns: auto;
		grid-template-rows: max-content max-content;
		display: grid;
		overflow: auto;
	}

	found-songs {
	}
</style>
