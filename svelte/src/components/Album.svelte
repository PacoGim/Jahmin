<script lang="ts">
	import { onMount } from 'svelte'

	import type { AlbumType } from '../types/album.type'
	import { selectedAlbumId } from '../store/final.store'
	import AlbumArt from './AlbumArt.svelte'
	import scrollToAlbumFn from '../functions/scrollToAlbum.fn'
	import generateId from '../functions/generateId.fn'

	export let album: AlbumType

	let artSize = 0

	let element

	onMount(() => {
		let lastPlayedAlbumId = localStorage.getItem('LastPlayedAlbumId')

		if (album.ID === lastPlayedAlbumId) {
			setTimeout(() => {
				scrollToAlbumFn(album.ID)
			}, 100)
		}

		artSize = Number(getComputedStyle(element).getPropertyValue('height').replace('px', ''))
	})
</script>

<album id={album.ID} class={$selectedAlbumId === album?.ID ? 'selected' : ''} bind:this={element}>

	<AlbumArt rootDir={album.RootDir} {artSize} observer="addObserver" style="height:inherit;width:inherit;cursor:pointer;" />

	<overlay-gradient />

	<album-details>
		<album-name>{album['Name'] || ''}</album-name>

		{#if album['AlbumArtist'] !== undefined}
			<album-artist>{album['AlbumArtist'] || ''}</album-artist>
		{:else if album['DynamicAlbumArtist'] !== undefined}
			<album-artist>{album['DynamicAlbumArtist'] || ''}</album-artist>
		{:else}
			<album-artist />
		{/if}
	</album-details>
</album>

<style>
	album.selected {
		box-shadow: 0 0 10px 5px #ffffff, 0 0 0 5px rgba(255, 255, 255, 0.5);
		z-index: 1;
	}

	album {
		margin: var(--grid-gap);

		color: #fff;
		position: relative;
		display: grid;

		box-shadow: none;

		transition: box-shadow 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28);

		cursor: pointer;
		height: var(--art-dimension);
		width: var(--art-dimension);
		max-width: var(--art-dimension);
		max-height: var(--art-dimension);
	}

	album:hover overlay-gradient {
		opacity: 1;
	}

	album:hover album-name {
		transform: translateY(0px) rotateX(0deg);
		opacity: 1;
	}

	album:hover album-artist {
		transform: translateY(0px) rotateX(0deg);
		opacity: 1;
	}

	overlay-gradient {
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.5) 25%, rgba(0, 0, 0, 0) 50%);
		height: inherit;
		width: inherit;
		max-height: inherit;
		max-width: inherit;
		opacity: 0;

		transition: opacity 250ms ease-in-out;

		z-index: 1;
	}

	album-details {
		font-size: clamp(0.8rem, calc(var(--art-dimension) / 12), 1.2rem);

		max-width: var(--art-dimension);

		padding: 0.5rem 1rem;
		display: flex;
		flex-direction: column;
		align-self: end;
		text-align: center;
		transition: opacity 250ms ease-in-out;
		z-index: 2;
	}

	album-details album-name {
		transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
		opacity: 0;
		transform: translateY(-25px) rotateX(90deg);
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
		white-space: normal;
	}

	album-details album-artist {
		transition: transform 250ms ease-in-out, opacity 250ms ease-in-out;
		transition-delay: 100ms;
		opacity: 0;
		transform: translateY(-25px) rotateX(90deg);
	}

	album > * {
		grid-column: 1;
		grid-row: 1;
	}

	album-artist {
		/*text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		max-width: calc(var(--art-dimension) - 1.5rem); */

		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		/* max-width: calc(var(--art-dimension) - 1.5rem); */
	}

	album-name {
		/* text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		max-width: calc(var(--art-dimension) - 1.5rem); */

		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		/* max-width: calc(var(--art-dimension) - 1.5rem); */
	}
</style>
