<script lang="ts">
	import LyricsList from './LyricsList.svelte'
	import LyricName from './LyricName.svelte'
	import LyricsCreate from './LyricsCreate.svelte'
	import LyricsControls from './LyricsControls.svelte'
	import LyricsReadEdit from './LyricsReadEdit.svelte'

	let lyricsMode: 'Read' | 'Edit' = 'Edit'
</script>

<lyrics-layout class="layout">
	<LyricsList />

	<lyrics-body>
		<LyricName />
		<LyricsCreate />
		<LyricsControls {lyricsMode} on:lyricsModeChange={res => (lyricsMode = res.detail)} />
		<LyricsReadEdit {lyricsMode} />
	</lyrics-body>
</lyrics-layout>

<style>
	lyrics-layout {
		display: grid;

		grid-template-columns: 1fr 4fr;
	}

	lyrics-body {
		display: grid;

		grid-template-columns: auto max-content;
		grid-template-rows: max-content max-content auto;

		overflow: hidden;

		grid-template-areas:
			'lyrics-name lyrics-create'
			'lyrics-controls lyrics-create'
			'lyrics-read-edit lyrics-read-edit';
	}
</style>
