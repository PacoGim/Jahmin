<script lang="ts">
	import { onMount } from 'svelte'

	import type { SongType } from '../../../types/song.type'

	import { playingSongStore, selectedSongsStore, songListItemElement } from '../stores/main.store'

	import SongTag from './SongTag.svelte'
	import tagToGridStyleFn from '../functions/tagToGridStyle.fn'
	import PlayButton from '../layouts/components/PlayButton.svelte'
	import { showDynamicArtistsConfig, songListTagConfig } from '../stores/config.store'

	export let song: SongType
	export let index: number

	let isSongPlaying = false
	let gridStyle = ''

	$: isSongPlaying = $playingSongStore?.ID === song?.ID

	// $: {
	// song
	// setDynamicArtists()
	// }

	$: {
		song
		// TODO Potential problem here.
		$songListTagConfig
		isSongPlaying
		buildGridStyle()
	}

	onMount(() => {
		// let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))

		// $songPlayingIdStore = lastPlayedSongId

		if ($songListItemElement === undefined) {
			$songListItemElement = document.querySelector('song-list-item')
		}
	})

	function buildGridStyle() {
		let tempGridStyle = tagToGridStyleFn($songListTagConfig)

		if (song.isEnabled === false) {
			tempGridStyle = 'minmax(min-content, max-content) ' + tempGridStyle
		}

		if (isSongPlaying) {
			tempGridStyle = 'minmax(min-content, max-content) ' + tempGridStyle
		}

		gridStyle = tempGridStyle
	}

	function setStar(starChangeEvent) {
		window.ipc.updateSongs([song], { Rating: starChangeEvent.detail.rating })
	}
</script>

<!-- {isSongPlaying === true ? 'playing' : ''} -->
<!-- style="grid-template-columns:{gridStyle};" -->
<song-list-item
	data-id={song.ID}
	data-index={index}
	style="grid-auto-columns:{gridStyle};"
	class="
	{song.isEnabled === false ? 'disabled' : ''}
	{$playingSongStore?.ID === song.ID ? 'playing' : ''}
	{$selectedSongsStore.includes(song.ID) ? 'selected' : ''}"
>
	{#if isSongPlaying === true}
		<PlayButton customSize="0.75rem" customColor="#fff" />
	{/if}

	{#each $songListTagConfig as tag, index (index)}
		<SongTag {song} {tag} on:starChange={setStar} />
	{/each}
</song-list-item>

<style>
	song-list-item {
		position: relative;
		cursor: pointer;

		align-items: center;

		min-height: var(--song-list-item-height);
		max-height: var(--song-list-item-height);
		height: var(--song-list-item-height);

		border: 0.125rem transparent solid;
		background-clip: padding-box;
		padding: 0.5rem 0.5rem;
		user-select: none;

		border-radius: 10px;

		transition-property: font-variation-settings, background-color, box-shadow;
		transition-duration: 250ms, 500ms, 500ms;
		transition-timing-function: ease-in-out;

		display: grid;
		grid-template-rows: auto;
		grid-auto-flow: column;
	}

	song-list-item:first-of-type {
		border-top: 0px;
	}

	song-list-item:last-of-type {
		border-bottom: 0px;
	}

	song-list-item.playing {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
		box-shadow: inset 0px 0px 0 2px rgba(255, 255, 255, 0.5);
	}

	song-list-item.selected {
		background-color: rgba(255, 255, 255, 0.1);
	}

	song-list-item:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	song-list-item.disabled {
		background-image: linear-gradient(
			45deg,
			rgba(255, 255, 255, 0) 25%,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.1) 50%,
			rgba(255, 255, 255, 0) 50%,
			rgba(255, 255, 255, 0) 75%,
			rgba(255, 255, 255, 0.1) 75%,
			rgba(255, 255, 255, 0.1) 100%
		);
		background-size: 28.28px 28.28px;
	}

	song-list-item.disabled::before {
		content: '🚫';
		margin-right: 5px;
		filter: grayscale(1) brightness(1000);

		font-size: 0.75rem;
	}
</style>
