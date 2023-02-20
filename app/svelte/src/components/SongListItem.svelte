<script lang="ts">
	import { onMount } from 'svelte'

	import type { SongType } from '../../../types/song.type'

	import { activeSongStore, config, playingSongStore, selectedSongsStore, songListItemElement } from '../stores/main.store'

	import SongTag from './SongTag.svelte'
	import tagToGridStyleFn from '../functions/tagToGridStyle.fn'
	import PlayButton from '../layouts/components/PlayButton.svelte'

	export let song: SongType
	export let index: number

	let isSongPlaying = false
	let gridStyle = ''

	$: isSongPlaying = $playingSongStore?.ID === song?.ID

	$: {
		song
		setDynamicArtists()
	}

	$: {
		song
		// TODO Potential problem here.
		$config.songListTags
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
		let tempGridStyle = tagToGridStyleFn($config.songListTags)

		if (song.isEnabled === false) {
			tempGridStyle = 'max-content ' + tempGridStyle
		}

		if (isSongPlaying) {
			tempGridStyle = 'max-content ' + tempGridStyle
		}

		gridStyle = tempGridStyle
	}

	function setDynamicArtists() {
		if (!song?.AlbumArtist || !song?.Artist) {
			song.DynamicArtists = ''
			return
		}

		let splitArtists = song.Artist.split('//').filter(artist => !song.AlbumArtist.includes(artist))

		if (splitArtists.length > 0) {
			song.DynamicArtists = `(feat. ${splitArtists.join('//')})`
		} else {
			song.DynamicArtists = ''
		}
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
	style="grid-template-columns:{gridStyle};"
	class="
	{song.isEnabled === false ? 'disabled' : ''}
	{$playingSongStore?.ID === song.ID ? 'playing' : ''}
	{$selectedSongsStore.includes(song.ID) ? 'selected' : ''}"
>
	{#if isSongPlaying === true}
		<PlayButton customSize="0.75rem" customColor="#fff" />
	{/if}
	{#each $config.songListTags as tag, index (index)}
		{#if tag.value === 'Title' && $config.songListTags.find(configTag => configTag.value === 'DynamicArtists')}
			<SongTag
				tagName={tag.value}
				tagValue={`${song[tag.value]} ${song.DynamicArtists}` || ''}
				align={tag?.align?.toLowerCase()}
				on:starChange={setStar}
			/>
		{:else if tag.value === 'DynamicArtists' || !$config.songListTags.find(configTag => configTag.value === 'Title')}
			<!-- Empty -->
		{:else}
			<SongTag tagName={tag.value} tagValue={song[tag.value] || ''} align={tag?.align?.toLowerCase()} on:starChange={setStar} />
		{/if}
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

		display: grid;
		/* grid-template-columns: max-content auto max-content max-content max-content; */
		grid-template-rows: auto;

		/* margin: 0.25rem 0; */
		/* border-bottom: 0.25rem transparent solid; */
		border: 0.125rem transparent solid;
		background-clip: padding-box;
		padding: 0.5rem 0.5rem;
		user-select: none;

		border-radius: 10px;

		/* transition-property: font-variation-settings, box-shadow, background-color; */
		transition-property: font-variation-settings, background-color, box-shadow;
		transition-duration: 250ms, 500ms, 500ms;
		transition-timing-function: ease-in-out;
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
		content: '🚫 ';
		filter: grayscale(1) brightness(1000);

		font-size: 0.75rem;
	}
</style>
