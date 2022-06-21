<script lang="ts">
	import { onDestroy, onMount } from 'svelte'

	import Album from '../../components/Album.svelte'

	import { artSizeConfig, gridGapConfig, groupByConfig, groupByValuesConfig } from '../../store/config.store'
	import { dbSongsStore, layoutToShow } from '../../store/final.store'

	import groupSongsByAlbumFn from '../../functions/groupSongsByAlbum.fn'

	import { selectedConfigOptionName } from '../../store/session.store'

	let albums

	// If the album art size has been set in the store.
	$: if ($artSizeConfig !== undefined) document.documentElement.style.setProperty('--art-dimension', `${$artSizeConfig}px`)
	$: if ($gridGapConfig !== undefined) document.documentElement.style.setProperty('--grid-gap', `${$gridGapConfig}px`)

	$: {
		if ($dbSongsStore && $groupByValuesConfig && $groupByConfig) {
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

	function handleAddFolder() {
		$selectedConfigOptionName = 'Library'
		$layoutToShow = 'Config'
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
	{#if $dbSongsStore.length > 0}
		{#each albums || [] as album (album.ID)}
			<Album {album} />
		{/each}
	{:else}
		<no-song-found-container>
			<p>No songs found!</p>
			<button on:click={() => handleAddFolder()}>Click here to add folder</button>
		</no-song-found-container>
	{/if}
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

	no-song-found-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
