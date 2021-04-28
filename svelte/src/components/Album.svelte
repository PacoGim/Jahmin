<script lang="ts">
	import { onMount } from 'svelte'
	import { getCoverIPC } from '../service/ipc.service'
	import { setNewPlayback } from '../functions/setNewPlayback.fn'
	// import { playback, selectedAlbum } from '../store/player.store'
	import type { AlbumType } from '../types/album.type'
	import { albumPlayingIdStore, selectedAlbumId } from '../store/final.store'
	import CoverArt from './CoverArt.svelte'

	export let album: AlbumType
	export let index
	let coverType = undefined
	let coverSrc = undefined /* Image Source URL */

	onMount(() => {
		let lastPlayedAlbumID = localStorage.getItem('LastPlayedAlbumID')

		if (album.ID === lastPlayedAlbumID) {
			let albumEl = document.querySelector(`#${CSS.escape(album.ID)}`)
			if (albumEl) {
				albumEl.scrollIntoView({ block: 'center' })
			}
		}
	})


	// function fetchAlbumCover() {
	// 	getCoverIPC(album['RootDir']).then((result) => {
	// 		if (result !== null) {
	// 			coverSrc = result['filePath']
	// 			coverType = result['fileType']
	// 		} else {
	// 			coverType = 'not found'
	// 		}
	// 	})
	// }

	// function addIntersectionObserver() {
	// 	new IntersectionObserver(
	// 		(entries) => {
	// 			if (entries[0].isIntersecting === true && coverSrc === undefined) {
	// 				fetchAlbumCover()
	// 			}
	// 		},
	// 		{ root: document.querySelector(`art-grid-svlt`), threshold: 0, rootMargin: '0px 0px 50% 0px' }
	// 	).observe(document.querySelector(`art-grid-svlt > #${CSS.escape(album['ID'])}`))
	// }

	/*
	on:dblclick={(evt) => prepareAlbum(evt)}
	on:click={(evt) => prepareAlbum(evt)}
*/
</script>

<album id={album.ID} class={$selectedAlbumId === album?.ID ? 'selected' : ''}>
	<CoverArt rootDir={album.RootDir} albumId={album.ID} />

	<overlay-gradient />

	<album-details>
		<album-name>{album['Name']}</album-name>

		{#if album['AlbumArtist'] !== undefined}
			<album-artist>{album['AlbumArtist']}</album-artist>
		{:else if album['DynamicAlbumArtist'] !== undefined}
			<album-artist>{album['DynamicAlbumArtist']}</album-artist>
		{:else}
			<album-artist />
		{/if}
	</album-details>
</album>

<style>
	album.selected {
		box-shadow: 0 0 10px 5px #ffffff, 0 0 0 5px rgba(255, 255, 255, 0.5);
	}

	album {
		position: relative;
		display: grid;

		box-shadow: none;

		transition: box-shadow 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28);

		margin: 1rem;
		cursor: pointer;
		height: var(--cover-dimension);
		width: var(--cover-dimension);
		max-width: var(--cover-dimension);
		max-height: var(--cover-dimension);
	}

	overlay-gradient {
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.5) 25%, rgba(0, 0, 0, 0) 50%);
		height: inherit;
		width: inherit;
	}

	album-details {
		padding: 0.5rem 1rem;
		display: flex;
		flex-direction: column;
		align-self: end;
		text-align: center;
	}

	album > * {
		grid-column: 1;
		grid-row: 1;
	}

	album-artist {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		max-width: calc(var(--cover-dimension) - 1.5rem);
	}

	album-name {
		font-variation-settings: 'wght' 500;
		white-space: normal;
	}
</style>
