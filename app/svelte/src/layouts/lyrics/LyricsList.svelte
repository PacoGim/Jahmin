<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import type { SongType } from '../../../../types/song.type'
	import getDirectoryFn from '../../functions/getDirectory.fn'
	import setNewPlaybackFn from '../../functions/setNewPlayback.fn'
	import { dbSongsStore, playbackStore, playingSongStore, songLyricsSelected } from '../../stores/main.store'

	export let updateLyricsList = undefined

	const dispatch = createEventDispatcher()

	let songList: SongType[] = []

	$: if ($dbSongsStore.length !== 0) getLyricsList()
	$: if (updateLyricsList === true) getLyricsList()

	function getLyricsList() {
		window.ipc.getLyricsList().then(lyricsList => {
			songList = lyricsList.map(lyrics =>
				$dbSongsStore.find(song => song.Title === lyrics.title && song.Artist === lyrics.artist)
			)
		})
	}

	function showLyrics(song: SongType, { updateSong }: { updateSong: boolean }) {
		$songLyricsSelected = {
			title: song.Title,
			artist: song.Artist
		}

		dispatch('show-lyrics', {
			title: song.Title,
			artist: song.Artist
		})

		if (updateSong === true) {
			let isSongInPlayback = $playbackStore.findIndex(value => value.ID === song.ID) === -1 ? false : true

			// If the song is in playback don't change the playback. If it is not on the playback create a new playback.
			let playbackSongs = isSongInPlayback === true ? $playbackStore : [song]

			setNewPlaybackFn(getDirectoryFn(song.SourceFile), playbackSongs, song.ID, { playNow: true })
		}
	}
</script>

<lyrics-list>
	{#each songList as song, index (index)}
		{#if song}
			<p
				data-active={$songLyricsSelected?.title === song.Title && $songLyricsSelected?.artist === song.Artist
					? 'true'
					: 'false'}
				on:click={evt => showLyrics(song, { updateSong: false })}
				on:dblclick={evt => showLyrics(song, { updateSong: true })}
			>
				{#if $playingSongStore?.Title === song?.Title && $playingSongStore?.Artist === song?.Artist}
					►
				{/if}
				{song?.Title} - {song?.Artist}
			</p>
		{/if}
	{/each}
</lyrics-list>

<style>
	lyrics-list {
		grid-area: lyrics-list;

		border-right: 2px solid var(--color-fg-1);
		padding: 1rem;
	}

	lyrics-list p {
		line-height: 1rem;
		cursor: pointer;
		margin-bottom: 0.5rem;
	}

	lyrics-list p[data-active='true'] {
		background-color: var(--color-fg-1);
		color: var(--color-bg-1);
		padding: 0.25rem 0.5rem;
		border-radius: 3px;
	}
</style>
