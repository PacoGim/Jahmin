<script lang="ts">
	import generateId from '../../functions/generateId.fn'

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
			userSearchIPC(searchString).then(result => {
				foundSongs = result

				setTimeout(() => {
					result.forEach(song => {
						song.matches.forEach(match => {
							highlightString(song.item, match)
						})
					})
				}, 250)
			})
		}, 1000)
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

	function highlightString(song: SongType, indexes) {
		const id = `${hash(song.SourceFile)}-${indexes.key}`
		let doc = document.getElementById(id)

		if (doc && indexes) {
			let result = indexes.indices
				.reduce((str, [start, end]) => {
					str[start] = `<span class="highlight">${str[start]}`
					str[end] = `${str[end]}</span>`
					return str
				}, song[indexes.key].split(''))
				.join('')

			doc.innerHTML = result
		}
	}
</script>

<search-layout class="layout" style="display:{$layoutToShow === 'Search' ? 'block' : 'none'}">
	<input type="text" bind:value={searchString} />
	<found-songs>
		{#each foundSongs as song, index (index)}
			<found-song
				on:click={() => {
					selectSong(song)
				}}
			>
				<search-title id="{hash(song.item.SourceFile)}-Title" />
				<search-artist id="{hash(song.item.SourceFile)}-Artist" />
				<search-album id="{hash(song.item.SourceFile)}-Album" />
				<search-composer id="{hash(song.item.SourceFile)}-Composer" />
				<search-album-artist id="{hash(song.item.SourceFile)}-AlbumArtist" />
			</found-song>
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

	found-song {
		display: block;
	}
	:global(found-song *.highlight) {
		color: red;
	}
</style>
