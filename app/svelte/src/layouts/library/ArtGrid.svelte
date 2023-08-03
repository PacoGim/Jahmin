<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte'

	import Album from '../../components/Album.svelte'

	import { dbVersionStore, elementMap, keyModifier, keyPressed, setSelectedAlbumsDir } from '../../stores/main.store'
	import { artSizeConfig, gridGapConfig, config, groupByConfig, groupByValueConfig } from '../../stores/config.store'

	import cssVariablesService from '../../services/cssVariables.service'
	import { hash } from '../../functions/hashString.fn'
	import { artGridEvents } from '../../stores/componentsEvents.store'
	import handleComponentsEventsFn from '../../functions/handleComponentsEvents.fn'

	let albums

	// If the album art size has been set in the store.
	$: if ($artSizeConfig !== undefined) cssVariablesService.set('art-dimension', `${$artSizeConfig}px`)
	$: if ($gridGapConfig !== undefined) cssVariablesService.set('grid-gap', `${$gridGapConfig}px`)

	$: if (/* Add the db versioning later */ $groupByConfig || $groupByValueConfig) {
		updateArtGridAlbums($groupByConfig, $groupByValueConfig)
	}

	$: $dbVersionStore !== 0 ? updateArtGridAlbums($groupByConfig, $groupByValueConfig) : null

	$: {
		if ($keyModifier === 'ctrlKey' && $keyPressed === 'a' && $elementMap.get('art-grid-svlt')) {
			selectAllAlbums()
		}
	}

	$: handleComponentsEventsFn($artGridEvents, 'ArtGrid')

	function updateArtGridAlbums(groupBy, groupByValue) {
		let whereQuery: any = [
			{
				Album: 'not null'
			}
		]

		if (groupByValue) {
			let tempWhere = {}

			if (groupBy === 'Year') {
				groupBy = 'DateYear'
			}

			tempWhere[groupBy] = groupByValue

			whereQuery.push(tempWhere)
		}

		window.ipc
			.bulkRead({
				queryData: {
					select: ['Sourcefile', 'Album', 'AlbumArtist', 'Artist', 'DateYear', 'Directory'],
					andWhere: whereQuery,
					group: ['Directory'],
					order: ['Directory']
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
				return song[$config.group.groupBy[index]] === $config.group.groupByValue[index]
			})
		})

		groupSongsByAlbumFn(songsFiltered).then(groupedAlbums => {
			// TODO add user controlled album sorting.
			albums = groupedAlbums.sort((a, b) => {
				return a.RootDir.localeCompare(b.RootDir)
			})
		}) */
	}

	function selectAllAlbums() {
		let albumElements = document.querySelectorAll('art-grid-svlt album')
		let albumElementsRootDir = []

		albumElements.forEach(albumElement => {
			let albumRootDir = albumElement.getAttribute('rootDir')
			albumElementsRootDir.push(albumRootDir)
		})

		setSelectedAlbumsDir([...albumElementsRootDir])

		// $selectedAlbumsDir = [...albumElementsRootDir]
	}

	onMount(() => {
		// Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined.
		//TODO Improve this part.
		/* 	groupByValueConfigObserver = groupByValueConfig.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		}) */
		// console.log('Hello?')
	})

	onDestroy(() => {
		// groupByValueConfigObserver()
	})

	// Run this function after each update cycle
	afterUpdate(() => {
		handleComponentsEventsFn($artGridEvents, 'ArtGrid')
	})
</script>

<art-grid-svlt>
	{#each albums || [] as album (album.ID)}
		<Album {album} from="ArtGrid" />
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
