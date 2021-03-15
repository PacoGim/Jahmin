<script lang="ts">
	import { onMount } from 'svelte'

	import type { SongType } from '../types/song.type'

	import { albumPlayingIdStore, playbackCursor, selectedAlbumId, selectedSongsStore } from '../store/final.store'

	import Star from './Star.svelte'

	export let song: SongType
	export let index: number

	function parseDuration(duration: number) {
		if (duration >= 60 * 60) {
			return new Date(duration * 1000).toISOString().substr(11, 8)
		} else {
			return new Date(duration * 1000).toISOString().substr(14, 5)
		}
	}

	onMount(() => {
		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongID'))

		if (lastPlayedSongId === song.ID) {
			let songEl = document.querySelector(`#${CSS.escape(String(lastPlayedSongId))}`)
			if (songEl) {
				songEl.scrollIntoView({ block: 'center' })
			}
		}
	})

	function setStar(starChangeEvent){

		// TODO: Add updater
		console.log(song.SourceFile,starChangeEvent.detail.starLevel)
	}
</script>

<song-list-item
	id={song.ID}
	{index}
	class="
	{$playbackCursor[0] === index && $selectedAlbumId === $albumPlayingIdStore
		? 'playing'
		: ''}
	{$selectedSongsStore.includes(song.ID) ? 'selected' : ''}"
>
	<!-- <song-number>{index}</song-number> -->
	<song-number>{song.Track}</song-number>
	<!-- <song-number>{song['ID']}</song-number> -->
	<song-title>{song.Title}</song-title>
	<Star on:starChange={setStar} songRating={song.Rating} />
	<song-duration>{parseDuration(song.Duration)}</song-duration>
</song-list-item>

<style>
	song-list-item {
		position: relative;
		cursor: pointer;

		align-items: center;

		display: grid;
		grid-template-columns: max-content auto max-content max-content;
		grid-template-rows: auto;

		margin: 0.25rem 0;
		padding: 0.25rem 0.5rem;
		user-select: none;

		border-radius: 5px;

		transition-property: font-variation-settings, box-shadow, background-color;
		transition-duration: 250ms;
		transition-timing-function: ease-in-out;
	}

	song-list-item > * {
		padding: 0 0.5rem;
	}

	song-list-item.playing {
		font-variation-settings: 'wght' 600;
		box-shadow: inset 0 0px 0 1px rgba(255, 255, 255, 0.5);
		background-color: rgba(255, 255, 255, 0.1);
	}
	song-list-item.selected {
		background-color: rgba(255, 255, 255, 0.15);
	}
</style>
