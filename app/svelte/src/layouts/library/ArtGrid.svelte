<script lang="ts">
	import { onDestroy, onMount } from 'svelte'

	import Album from '../../components/Album.svelte'

	import { config, dbSongsStore } from '../../stores/main.store'

	import groupSongsByAlbumFn from '../../functions/groupSongsByAlbum.fn'
	import cssVariablesService from '../../services/cssVariables.service'

	let albums

	// If the album art size has been set in the store.
	$: if ($config.userOptions.artSize !== undefined) cssVariablesService.set('art-dimension', `${$config.userOptions.artSize}px`)
	$: if ($config.userOptions.gridGap !== undefined) cssVariablesService.set('grid-gap', `${$config.userOptions.gridGap}px`)

	$: {
		if ($dbSongsStore && $config.group.groupByValues && $config.group.groupBy) {
			updateArtGridAlbums()
		}
	}

	let groupByValuesConfigObserver

	function updateArtGridAlbums() {
		let songsFiltered = []

		$config.group.groupBy.forEach((group, index) => {
			songsFiltered = $dbSongsStore.filter(song => {
				return song[$config.group.groupBy[index]] === $config.group.groupByValues[index]
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
		//TODO Improve this part.
		/* 	groupByValuesConfigObserver = groupByValuesConfig.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		}) */
	})

	onDestroy(() => {
		// groupByValuesConfigObserver()
	})
</script>

<art-grid-svlt>
	{#each albums || [] as album (album.ID)}
		<Album {album} />
	{/each}
</art-grid-svlt>

<style>
	art-grid-svlt {
		background-color: rgba(255, 255, 255, 0.25);

		padding: var(--grid-gap);

		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
		grid-area: art-grid-svlt;

		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;

		gap: var(--grid-gap);

		transition-property: padding gap;
		transition-duration: 150ms;
		transition-timing-function: linear;
	}
</style>
