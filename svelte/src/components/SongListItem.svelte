<script lang="ts">
	import { onMount } from 'svelte'

	import type { SongType } from '../types/song.type'

	import { albumPlayingIdStore, isPlaying, selectedAlbumId, selectedSongsStore, songPlayingIdStore } from '../store/final.store'

	import Star from './Star.svelte'
	import parseDuration from '../functions/parseDuration.fn'
	import { editTagsIPC } from '../service/ipc.service'
	import { songListTagsConfig } from '../store/config.store'
	import SongTag from './SongTag.svelte'
	import tagToGridStyleFn from '../functions/tagToGridStyle.fn'

	export let song: SongType
	export let index: number

	let isSongPlaying = $songPlayingIdStore === song.ID && $selectedAlbumId === $albumPlayingIdStore
	let gridStyle = ''

	$: {
		isSongPlaying = $songPlayingIdStore === song.ID && $selectedAlbumId === $albumPlayingIdStore
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

		// if (lastPlayedSongId === song.ID) {
		// let songEl = document.querySelector(`#${CSS.escape(String(lastPlayedSongId))}`)
		// if (songEl) {
		// 	songEl.scrollIntoView({ block: 'center' })
		// }
		// }
	})

	function setDynamicArtists() {
		let splitArtists = song.Artist.split('//').filter(artist => !song.AlbumArtist.includes(artist))

		if (splitArtists.length > 0) {
			song.DynamicArtists = `(feat. ${splitArtists.join('//')})`
		}
	}

	function setStar(starChangeEvent) {
		// console.log(song.SourceFile, starChangeEvent.detail.starRating)
		editTagsIPC([song.SourceFile], {
			Rating: starChangeEvent.detail.starRating
		})
	}
</script>

<song-list-item
	id={song.ID}
	{index}
	style="grid-template-columns:{isSongPlaying === true ? 'max-content' : ''}{gridStyle};"
	class="
	{isSongPlaying === true ? 'playing' : ''}
	{$selectedSongsStore.includes(song.ID) ? 'selected' : ''}"
>
	{#each $songListTagsConfig as tag, index (index)}
		{#if tag.name === 'Rating'}
			<Star on:starChange={setStar} songRating={song.Rating} hook="song-list-item" />
		{:else if tag.name === 'Title'}
			<SongTag
				data='{song[tag.name]} {song.DynamicArtists !== undefined ? song.DynamicArtists : ''}'
				customStyle="display: -webkit-box;-webkit-line-clamp: 1;-webkit-box-orient: vertical;overflow:hidden;max-height:22px;"
				tagName={tag.name}
				align={tag?.align?.toLowerCase()}
			/>
		{:else}
			<SongTag data={song[tag.name]} tagName={tag.name} align={tag?.align?.toLowerCase()} />
		{/if}
	{/each}
</song-list-item>

<style>
	song-list-item.playing::before {
		content: '▶ ';
		font-size: 0.75rem;
	}
	song-list-item {
		position: relative;
		cursor: pointer;

		align-items: center;

		min-height: 30px;
		max-height: 30px;

		display: grid;
		/* grid-template-columns: max-content auto max-content max-content max-content; */
		grid-template-rows: auto;

		margin: 0.25rem 0;
		padding: 0.25rem 0.5rem;
		user-select: none;

		border-radius: 5px;

		transition-property: font-variation-settings, box-shadow, background-color;
		transition-duration: 250ms;
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
</style>
