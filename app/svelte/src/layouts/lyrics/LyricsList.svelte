<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import limitCharactersFn from '../../functions/limitCharacters.fn'
	import { dbSongsStore, playbackStore, playingSongStore } from '../../stores/main.store'
	import setNewPlaybackFn from '../../functions/setNewPlayback.fn'
	import getDirectoryFn from '../../functions/getDirectory.fn'
	import PlayButton from '../components/PlayButton.svelte'

	const dispatch = createEventDispatcher()

	export let selectedLyrics = { title: '', artist: '' }

	export let lyricsList = []

	function selectLyric(title: string, artist: string) {
		dispatch('selectedLyrics', {
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

	window.ipc.onLyricsDeleted((_, response) => {
		if (response.code === 0) {
			let foundItemIndex = lyricsList.findIndex(
				item => item.title === response.data.title && item.artist === response.data.artist
			)

			if (foundItemIndex !== -1) {
				lyricsList.splice(foundItemIndex, 1)
				lyricsList = lyricsList

				if (selectedLyrics.title === response.data.title && selectedLyrics.artist === response.data.artist) {
					dispatch('selectedLyrics', {
						title: '',
						artist: ''
					})
				}
			}
		} else if (response.code === -1) {



		}
	})

	// class:playing={lyrics.title === $playingSongStore.Title && lyrics.artist === $playingSongStore.Artist}
</script>

<lyrics-list>
	{#each lyricsList as lyrics, index (index)}
		<lyrics-container
			class:selected={lyrics.title === selectedLyrics.title && lyrics.artist === selectedLyrics.artist}
			on:click={() => selectLyric(lyrics.title, lyrics.artist)}
			on:dblclick={() => playSong(lyrics.title, lyrics.artist)}
			on:keypress={() => selectLyric(lyrics.title, lyrics.artist)}
			data-lyrics-title={lyrics.title}
			data-lyrics-artist={lyrics.artist}
			tabindex="-1"
			role="button"
		>
			<content>
				<!-- Mainly used to apply a text ellipsis -->
				{#if lyrics.title === $playingSongStore.Title && lyrics.artist === $playingSongStore.Artist}
					<PlayButton
						customSize="0.75rem"
						customMargins="0 .25rem 0 0"
						customColor={lyrics.title === selectedLyrics.title && lyrics.artist === selectedLyrics.artist
							? '#fff'
							: 'var(--color-fg-1)'}
					/>
					{`${lyrics.title} - ${lyrics.artist}`}
				{:else}
					{`${lyrics.title} - ${lyrics.artist}`}
				{/if}
			</content>
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

		max-width: 300px;
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

	lyrics-list lyrics-container content {
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	lyrics-list lyrics-container:hover {
		border-color: var(--color-accent-1);
	}

	lyrics-list lyrics-container.selected {
		background-color: var(--color-accent-1);
		color: #fff;
	}
</style>
