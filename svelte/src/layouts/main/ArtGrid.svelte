<script lang="ts">
	import { onMount } from 'svelte'

	import { liveQuery } from 'dexie'
	import { db } from '../../db/db'

	import Album from '../../components/Album.svelte'
	import scrollToAlbumFn from '../../functions/scrollToAlbum.fn'
	import { artSizeConfig, gridGapConfig } from '../../store/config.store'
	import { albumListStore, selectedGroupByStore, selectedGroupByValueStore } from '../../store/final.store'
	import { hash } from '../../functions/hashString.fn'

	// If the album art size has been set in the store.
	$: if ($artSizeConfig !== undefined) document.documentElement.style.setProperty('--art-dimension', `${$artSizeConfig}px`)
	$: if ($gridGapConfig !== undefined) document.documentElement.style.setProperty('--grid-gap', `${$gridGapConfig}px`)

	let groupBy = 'Genre'
	let groupByValue = 'Alternative'

	let albums = liveQuery(async () => {
		let results = await db.songs.where(groupBy).equals(groupByValue).toArray()
		return await groupSongs(results)
	})

	function groupSongs(results) {
		return new Promise((resolve, reject) => {
			let albums = []
			results.forEach(song => {
				const albumId = hash(song.SourceFile.split('/').slice(0, -1).join('/'))

				let album = albums.find(album => album.ID === albumId)

				if (album === undefined) {
					album = {
						ID: albumId,
						Songs: []
					}

					albums.push(album)
				}

				album.Songs.push(song)

				albums[albums.indexOf(album)] = album
			})

			resolve(albums)
		})
	}

	onMount(() => {
		// Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined.
		selectedGroupByStore.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		})()

		selectedGroupByValueStore.subscribe(() => {
			document.querySelector('art-grid-svlt').scrollTop = 0
		})()
	})
</script>

<art-grid-svlt>
	{#each $albums || [] as album (album.ID)}
		<!-- {album} -->
		<Album {album} />
	{/each}

	<!-- {#each $albumListStore as album (album.ID)}
		<Album {album} />
	{/each} -->
</art-grid-svlt>

<style>
	art-grid-svlt {
		padding: var(--grid-gap);

		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
		grid-area: art-grid-svlt;

		/* 		display: flex;
		flex-wrap: wrap;
		align-content: flex-start; */
	}
</style>
