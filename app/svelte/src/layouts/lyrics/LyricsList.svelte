<script lang="ts">
	import type { SongType } from '../../../../types/song.type'
	import getDirectoryFn from '../../functions/getDirectory.fn'
	import setNewPlaybackFn from '../../functions/setNewPlayback.fn'
	import { dbSongsStore, playingSongStore } from '../../stores/main.store'

	export let updateLyricsList = undefined

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

	function showLyrics(song: SongType, { playNow }: { playNow: boolean }) {
		setNewPlaybackFn(getDirectoryFn(song.SourceFile), [song], song.ID, { playNow })
	}
</script>

<lyrics-list>
	{#each songList as song, index (index)}
		<p
			data-active={$playingSongStore?.ID === song.ID ? 'true' : 'false'}
			on:click={evt => showLyrics(song, { playNow: false })}
			on:dblclick={evt => showLyrics(song, { playNow: true })}
		>
			{song.Artist} - {song.Title}
		</p>
	{/each}
</lyrics-list>

<style>
	lyrics-list {
		grid-area: lyrics-list;

		border-right: 2px solid var(--color-fg-1);
		padding: 1rem;
	}

	lyrics-list p {
		cursor: pointer;
	}

	lyrics-list p[data-active='true'] {
		background-color: var(--color-fg-1);
		color: var(--color-bg-1);
		padding: 0.25rem 0.5rem;
		border-radius: 3px;
	}
</style>
