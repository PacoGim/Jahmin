<script lang="ts">
	import { selectedSongsStore, songListStore } from '../store/final.store'
	import type { SongType } from '../types/song.type'

	let songsToEdit: SongType[] = []
	// let tagList=

	$: getSelectedSongs($selectedSongsStore, $songListStore)

	$: if (songsToEdit.length !== 0) groupSongs(songsToEdit)

	function getSelectedSongs(selectedSongs: number[], songList: SongType[]) {
		if (songList.length <= 0) return

		// If no songs selected, edit full array. Otherwise edit only selected songs.
		selectedSongs.length === 0
			? (songsToEdit = songList)
			: (songsToEdit = songList.filter((song) => selectedSongs.includes(song.ID)))
	}

	function groupSongs(songsToEdit:SongType[]) {

		console.log(songsToEdit[0])

	}
</script>

<tag-edit-svlt>
	<component-name>Tag Edit</component-name>

	<button-group>
		<button>Update</button>

		<button>Cancel</button>
	</button-group>
</tag-edit-svlt>

<style>
	button-group {
		display: flex;
		justify-content: space-evenly;
	}

	button-group button {
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: none;
	}

	date-tag-editor {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}

	track-disc-tag-editor {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
	}

	tag-edit-svlt {
		grid-area: tag-edit-svlt;

		display: flex;
		flex-direction: column;

		background-color: rgba(0, 0, 0, 0.25);
	}

	component-name {
		text-align: center;
		padding: 0.5rem;
		background-color: rgba(255, 255, 255, 0.05);
		margin-bottom: 0.5rem;
		/* font-size: .9rem; */
	}
</style>
