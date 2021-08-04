<script lang="ts">
	import { onMount } from 'svelte'

	import type { SongType } from '../types/song.type'

	import { albumPlayingIdStore, selectedAlbumId, selectedSongsStore, songPlayingIdStore } from '../store/final.store'

	import Star from './Star.svelte'
	import { parseDuration } from '../functions/parseDuration.fn'
	import { editTagsIPC } from '../service/ipc.service'

	export let song: SongType
	export let index: number

	$: {
		song
		setDynamicArtists()
	}

	onMount(() => {
		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))

		$songPlayingIdStore = lastPlayedSongId

		if (lastPlayedSongId === song.ID) {
			let songEl = document.querySelector(`#${CSS.escape(String(lastPlayedSongId))}`)
			if (songEl) {
				songEl.scrollIntoView({ block: 'center' })
			}
		}
	})

	function setDynamicArtists() {
		let splitArtists = song.Artist.split('//').filter((artist) => !song.AlbumArtist.includes(artist))

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
	class="
	{$songPlayingIdStore === song.ID && $selectedAlbumId === $albumPlayingIdStore ? 'playing' : ''}
	{$selectedSongsStore.includes(song.ID) ? 'selected' : ''}"
>
	<song-number>{song.Track}</song-number>
	<song-title>{song.Title}</song-title>
	<song-artist>{song.DynamicArtists !== undefined ? song.DynamicArtists : ''}</song-artist>
	<Star on:starChange={setStar} songRating={song.Rating} hook="song-list-item" />
	<song-duration>{parseDuration(song.Duration)}</song-duration>
</song-list-item>

<style>
	song-title {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	song-list-item.playing song-title::before {
		content: '▶ ';
		font-size: 0.75rem;
	}
	song-list-item {
		position: relative;
		cursor: pointer;

		align-items: center;

		min-height: 30px;

		display: grid;
		grid-template-columns: max-content auto max-content max-content max-content;
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
