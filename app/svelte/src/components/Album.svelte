<script lang="ts">
	import type { AlbumType } from '../../../types/album.type'
	import { selectedAlbumsDir } from '../stores/main.store'
	import { configStore } from '../stores/config.store'
	import AlbumArt from './AlbumArt.svelte'

	export let album: AlbumType
	export let from = ''
</script>

<album
	alwaysShowOverlay={$configStore.userOptions.alwaysShowAlbumOverlay}
	rootDir={album.Directory}
	class={$selectedAlbumsDir?.includes(album?.Directory) ? 'selected' : ''}
>
	<AlbumArt imageSourceLocation={album.Directory} {from} intersectionRoot="art-grid-svlt" />

	<overlay-gradient />

	<album-details>
		<album-name>{album.Album || ''}</album-name>

		{#if album.AlbumArtist !== undefined}
			<album-artist>{album.AlbumArtist || ''}</album-artist>
		{:else}
			<album-artist />
		{/if}
	</album-details>
</album>

<style>
	:global(body[theme='Day']) album.selected {
		box-shadow: inset 0 0 0 3px transparent, 0 0 10px 5px hsl(38, 100%, 78%), 0 0 0 5px hsla(38, 100%, 81%, 0.5);
	}

	:global(body[theme='Night']) album.selected {
		box-shadow: inset 0 0 0 3px transparent, 0 0 10px 5px #ffffff, 0 0 0 5px rgba(255, 255, 255, 0.5);
	}

	album.selected {
		z-index: 1;
	}

	album {
		color: #fff;
		position: relative;
		display: grid;

		box-shadow: inset 0 0 0 3px #fff;

		transition: box-shadow 500ms cubic-bezier(0.18, 0.89, 0.32, 1.28);

		cursor: pointer;
		height: var(--art-dimension);
		width: var(--art-dimension);
		max-width: var(--art-dimension);
		max-height: var(--art-dimension);
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

	album:hover overlay-gradient,
	album[alwaysShowOverlay='true'] overlay-gradient {
		opacity: 1;
	}

	album:hover album-name,
	album:hover album-artist,
	album[alwaysShowOverlay='true'] album-name,
	album[alwaysShowOverlay='true'] album-artist {
		transform: translateY(0px) rotateX(0deg);
		opacity: 1;
	}
</style>
