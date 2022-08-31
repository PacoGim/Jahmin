<script lang="ts">
	import { onMount } from 'svelte'

	import type { SongType } from '../types/song.type'

	import { activeSongStore, config, playingSongStore, selectedSongsStore, songListItemElement } from '../stores/main.store'

	import SongTag from './SongTag.svelte'
	import tagToGridStyleFn from '../functions/tagToGridStyle.fn'
	import PlayButton from '../layouts/components/PlayButton.svelte'

	export let song: SongType
	export let index: number

	// TODO Fix this
	// let isSongPlaying = $playingSongStore?.ID === song?.ID && $selectedAlbumId === $playingSongStore.ID
	let isSongPlaying = true
	let gridStyle = ''

	$: {
		// isSongPlaying = $playingSongStore?.ID === song?.ID && $selectedAlbumId === $playingSongStore.ID
	}

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
	{$activeSongStore === song.ID ? 'active' : ''}
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
			<!--  -->
		{:else}
			<SongTag tagName={tag.value} tagValue={song[tag.value] || ''} align={tag?.align?.toLowerCase()} on:starChange={setStar} />
		{/if}
	{/each}
</song-list-item>

<!--
	{#if tag.value === 'Rating'}
		<Star on:starChange={setStar} songRating={song.Rating} hook="song-list-item" />
	{:else if tag.value === 'Title'}
		<SongTag
			data="{song[tag.value] || ''} {song.DynamicArtists !== undefined ? song.DynamicArtists : ''}"
			customStyle={titleTagStyle}
			tagName={tag.value}
			align={tag?.align?.toLowerCase()}
		/>
	{:else if tag.value === 'PlayCount'}
		<SongTag data={song[tag.value]} customStyle={playCountTagStyle} tagName={tag.value} align={tag?.align?.toLowerCase()} />
	{:else}
	{/if} -->
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
		transition-property: font-variation-settings, background-color, box-shadow;
		transition-duration: 250ms, 500ms, 500ms;
		transition-timing-function: ease-in-out;
	}

	/* song-list-item.playing {
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
		box-shadow: inset 0 0px 0 1px rgba(255, 255, 255, 0.5);
		background-color: rgba(255, 255, 255, 0.1);
	} */
	song-list-item.active {
		box-shadow: inset 0 0px 0 1px rgba(255, 255, 255, 0.5);
	}
	song-list-item.selected {
		background-color: rgba(255, 255, 255, 0.15);
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
