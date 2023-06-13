<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import limitCharactersFn from '../../functions/limitCharacters.fn'
	import { dbSongsStore, playbackStore, playingSongStore } from '../../stores/main.store'
	import setNewPlaybackFn from '../../functions/setNewPlayback.fn'
	import getDirectoryFn from '../../functions/getDirectory.fn'
	import PlayButton from '../components/PlayButton.svelte'

	const dispatch = createEventDispatcher()

	export let selectedLyric = { title: '', artist: '' }

	export let lyricList = []

	function selectLyric(title: string, artist: string) {
		dispatch('selectedLyric', {
			title,
			artist
		})
	}

	function playSong(songTitle: string, songArtist: string) {
		let songPlaybackIndex = $playbackStore.findIndex(value => value.Title === songTitle && value.Artist === songArtist)
		let songToPlay = $dbSongsStore.find(song => song.Title === songTitle && song.Artist === songArtist)
		let newPlayback = undefined

		if (songPlaybackIndex !== -1) {
			newPlayback = $playbackStore
		} else if (songPlaybackIndex === -1) {
			newPlayback = [songToPlay]
		}

		if (songToPlay) {
			setNewPlaybackFn(getDirectoryFn(songToPlay.SourceFile), newPlayback, songToPlay.ID, { playNow: true })
		}
	}

	function myAction(node) {
		console.log(node)
	}

	// class:playing={lyrics.title === $playingSongStore.Title && lyrics.artist === $playingSongStore.Artist}
</script>

<lyrics-list>
	{#each lyricList as lyrics, index (index)}
		<lyrics-container
			class:selected={lyrics.title === selectedLyric.title && lyrics.artist === selectedLyric.artist}
			on:click={() => selectLyric(lyrics.title, lyrics.artist)}
			on:dblclick={() => playSong(lyrics.title, lyrics.artist)}
			on:keypress={() => selectLyric(lyrics.title, lyrics.artist)}
			tabindex="-1"
			role="button"
		>
			{#if lyrics.title === $playingSongStore.Title && lyrics.artist === $playingSongStore.Artist}

					<PlayButton customSize="0.75rem" customMargins="0 .25rem 0 0" customColor={lyrics.title === selectedLyric.title && lyrics.artist === selectedLyric.artist?'#fff':'var(--color-fg-1)'} />


				{limitCharactersFn(`${lyrics.title} - ${lyrics.artist}`, 38)}
			{:else}
				{limitCharactersFn(`${lyrics.title} - ${lyrics.artist}`, 40)}
			{/if}
		</lyrics-container>
	{/each}
</lyrics-list>

<style>
	lyrics-list {
		background-color: var(--color-bg-2);
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		overflow-y: auto;

		min-width: 300px;
	}

	lyrics-list lyrics-container {
		cursor: pointer;
		background-color: var(--color-bg-3);
		padding: 0.25rem 0.5rem;
		margin-bottom: 0.5rem;
		white-space: nowrap;
		font-size: 0.9rem;
		border-radius: 3px;
		border: 2px transparent solid;

		display: flex;
		align-items: center;

		transition-property: color, background-color, border-color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}

	lyrics-list lyrics-container:hover {
		border-color: var(--color-accent-1);
	}

	lyrics-list lyrics-container.selected {
		background-color: var(--color-accent-1);
		color: #fff;
	}
</style>
