<script lang="ts">
	import { onMount } from 'svelte'

	import type { SongType } from '../types/song.type'

	import {
		albumPlayingIdStore,
		playingSongStore,
		selectedAlbumId,
		selectedSongsStore,
		songListItemElement,
		songPlayingIdStore
	} from '../store/final.store'

	import Star from './Star.svelte'
	import { editTagsIPC, updateSongsIPC } from '../services/ipc.service'
	import { songListTagsConfig } from '../store/config.store'
	import SongTag from './SongTag.svelte'
	import tagToGridStyleFn from '../functions/tagToGridStyle.fn'

	export let song: SongType
	export let index: number

	let isSongPlaying = $playingSongStore?.ID === song?.ID && $selectedAlbumId === $albumPlayingIdStore
	let isDisabled = false
	let gridStyle = ''

	$: {
		isSongPlaying = $playingSongStore?.ID === song?.ID && $selectedAlbumId === $albumPlayingIdStore
	}

	$: {
		song
		setDynamicArtists()
	}

	$: {
		gridStyle = tagToGridStyleFn($songListTagsConfig)
	}

	onMount(() => {
		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))

		$songPlayingIdStore = lastPlayedSongId

		if ($songListItemElement === undefined) {
			$songListItemElement = document.querySelector('song-list-item')
		}
	})

	function setDynamicArtists() {
		if (!song?.AlbumArtist || !song?.Artist) {
			song.DynamicArtists = ''
			return
		}

		let splitArtists = song.Artist.split('//').filter(artist => !song.AlbumArtist.includes(artist))

		if (splitArtists.length > 0) {
			song.DynamicArtists = `(feat. ${splitArtists.join('//')})`
		}
	}

	function setStar(starChangeEvent) {
		updateSongsIPC([song], { Rating: starChangeEvent.detail.rating })
	}
</script>

<song-list-item
	data-id={song.ID}
	data-index={index}
	style="grid-template-columns:{isDisabled === true || isSongPlaying === true ? 'max-content' : ''}{gridStyle};"
	class="
	{isDisabled === true ? 'disabled' : ''}
	{isSongPlaying === true ? 'playing' : ''}
	{$selectedSongsStore.includes(song.ID) ? 'selected' : ''}"
>
	{#each $songListTagsConfig as tag, index (index)}
		{#if tag.name === 'Rating'}
			<Star on:starChange={setStar} songRating={song.Rating} hook="song-list-item" />
		{:else if tag.name === 'Title'}
			<SongTag
				data="{song[tag.name] || ''} {song.DynamicArtists !== undefined ? song.DynamicArtists : ''}"
				customStyle="display: -webkit-box;-webkit-line-clamp: 1;-webkit-box-orient: vertical;overflow:hidden;max-height:22px;"
				tagName={tag.name}
				align={tag?.align?.toLowerCase()}
			/>
		{:else}
			<SongTag data={song[tag.name] || ''} tagName={tag.name} align={tag?.align?.toLowerCase()} />
		{/if}
	{/each}
</song-list-item>

<style>
	song-list-item {
		position: relative;
		cursor: pointer;

		align-items: center;

		--height: 36px;

		min-height: var(--height);
		max-height: var(--height);
		height: var(--height);

		display: grid;
		/* grid-template-columns: max-content auto max-content max-content max-content; */
		grid-template-rows: auto;

		/* margin: 0.25rem 0; */
		border-bottom: 0.25rem transparent solid;
		border-top: 0.25rem transparent solid;
		background-clip: padding-box;
		padding: 0.25rem 0.5rem;
		user-select: none;

		border-radius: 5px;

		/* transition-property: font-variation-settings, box-shadow, background-color; */
		transition-property: font-variation-settings, background-color;
		transition-duration: 250ms, 500ms;
		transition-timing-function: ease-in-out;
	}

	song-list-item.playing {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
		box-shadow: inset 0 0px 0 1px rgba(255, 255, 255, 0.5);
		background-color: rgba(255, 255, 255, 0.1);
	}
	song-list-item.selected {
		background-color: rgba(255, 255, 255, 0.15);
	}

	song-list-item.disabled {
		background: repeating-linear-gradient(
			45deg,
			rgba(255, 255, 255, 0),
			rgba(255, 255, 255, 0) 10px,
			rgba(255, 255, 255, 0.1) 10px,
			rgba(255, 255, 255, 0.1) 20px
		);
	}

	song-list-item.disabled::before {
		content: '🚫 ';
		filter: grayscale(1) brightness(1000);

		font-size: 0.75rem;
	}

	song-list-item.playing::before {
		content: '▶ ';
		font-size: 0.75rem;
	}
</style>
