<script lang="ts">
	import { onDestroy, onMount } from 'svelte'

	import Album from '../../components/Album.svelte'

	import { dbSongsStore, dbVersionStore, elementMap, keyModifier, keyPressed, selectedAlbumsDir } from '../../stores/main.store'
	import { artSizeConfig, gridGapConfig, config, groupByConfig, groupByValuesConfig } from '../../stores/config.store'

	import groupSongsByAlbumFn from '../../functions/groupSongsByAlbum.fn'
	import cssVariablesService from '../../services/cssVariables.service'
	import getDirectoryFn from '../../functions/getDirectory.fn'
	import { hash } from '../../functions/hashString.fn'
	import getDynamicAlbumArtistsFn from '../../functions/getDynamicAlbumArtists.fn'

	let albums

	// If the album art size has been set in the store.
	$: if ($artSizeConfig !== undefined) cssVariablesService.set('art-dimension', `${$artSizeConfig}px`)
	$: if ($gridGapConfig !== undefined) cssVariablesService.set('grid-gap', `${$gridGapConfig}px`)

	$: if (/* Add the db versioning later */ $groupByConfig || $groupByValuesConfig) {
		updateArtGridAlbums($groupByConfig, $groupByValuesConfig)
	}

	$: $dbVersionStore !== 0 ? updateArtGridAlbums($groupByConfig, $groupByValuesConfig) : null

	$: {
		if ($keyModifier === 'ctrlKey' && $keyPressed === 'a' && $elementMap.get('art-grid-svlt')) {
			selecteAllAlbums()
		}
	}

	function updateArtGridAlbums(groupBy, groupByValues) {
		let whereQuery: any = [
			{
				Album: 'not null'
			}
		]

		for (let index in groupBy) {
			let tempWhere = {}
			tempWhere[groupBy[index]] = groupByValues[index]

			whereQuery.push(tempWhere)
		}

		window.ipc
			.bulkRead({
				queryData: {
					select: ['Sourcefile', 'Album', 'AlbumArtist', 'Artist', 'DateYear', 'Directory'],
					andWhere: whereQuery,
					group: ['Directory'],
					order: ['Directory'] //TODO add the proper sorting here and in Player middleware
				}
			})
			.then(response => {
				albums = response.results.data.map((item, index, songArray) => {
					return {
						ID: hash(item.Directory, 'text'),
						...item
					}
				})
			})

		/* 		let songsFiltered = []

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
		}) */
	}

	function selecteAllAlbums() {
		let albumElements = document.querySelectorAll('art-grid-svlt album')
		let albumElementsRootDir = []

		albumElements.forEach(albumElement => {
			let albumRootDir = albumElement.getAttribute('rootDir')
			albumElementsRootDir.push(albumRootDir)
		})

		$selectedAlbumsDir = [...albumElementsRootDir]
	}

	onMount(() => {
		// Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined.
		//TODO Improve this part.
		/* 	groupByValuesConfigObserver = groupByValuesConfig.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		}) */
		// console.log('Hello?')
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
