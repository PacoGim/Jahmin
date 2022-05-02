<script lang="ts">
	import { onDestroy, onMount } from 'svelte'

	import { liveQuery } from 'dexie'
	import { db } from '../../db/db'

	import Album from '../../components/Album.svelte'
	import scrollToAlbumFn from '../../functions/scrollToAlbum.fn'
	import { artSizeConfig, gridGapConfig, groupByConfig, groupByValuesConfig } from '../../store/config.store'
	import { albumListStore, dbSongsStore, selectedGroupByStore, selectedGroupByValueStore } from '../../store/final.store'
	import { hash } from '../../functions/hashString.fn'
	import groupSongsByAlbumFn from '../../functions/groupSongsByAlbum.fn'

	let albums

	// If the album art size has been set in the store.
	$: if ($artSizeConfig !== undefined) document.documentElement.style.setProperty('--art-dimension', `${$artSizeConfig}px`)
	$: if ($gridGapConfig !== undefined) document.documentElement.style.setProperty('--grid-gap', `${$gridGapConfig}px`)

	$: {
		if ($dbSongsStore && $dbSongsStore.length > 0 && $groupByValuesConfig && $groupByConfig) {
			updateArtGridAlbums()
		}
	}

	let groupByValuesConfigObserver

	function updateArtGridAlbums() {
		let songsFiltered = []

		$groupByConfig.forEach((group, index) => {
			songsFiltered = $dbSongsStore.filter(song => {
				return song[$groupByConfig[index]] === $groupByValuesConfig[index]
			})
		})

		groupSongsByAlbumFn(songsFiltered).then(groupedAlbums => {

			// TODO add user controlled album sorting.
			albums = groupedAlbums.sort((a, b) => {
				return a.RootDir.localeCompare(b.RootDir)
			})
		})
	}

	onMount(() => {
		// Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined.
		groupByValuesConfigObserver = groupByValuesConfig.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		})
	})

	onDestroy(() => {
		groupByValuesConfigObserver()
	})
</script>

<art-grid-svlt>
	{#each albums || [] as album (album.ID)}
		<Album {album} />
	{/each}
</art-grid-svlt>

<style>
	art-grid-svlt {
		padding: var(--grid-gap);

		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
		grid-area: art-grid-svlt;

		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
	}
</style>
