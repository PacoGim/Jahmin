<script lang="ts">
	import { selectedSongs } from '../store/index.store'
	import { selectedAlbum } from '../store/player.store'

	$: {
		$selectedSongs
		checkSongs()
	}

	function checkSongs() {
		if (!$selectedAlbum?.Songs) return

		let songs = []

		$selectedSongs.forEach((index) => {
			songs.push($selectedAlbum.Songs[index])
		})

		if (songs.length === 0) {
			songs = $selectedAlbum.Songs
		}
	}
</script>

<details-svlt />

<style>
	details-svlt {
		grid-area: details-svlt;
		background-color: rgba(0, 0, 0, 0.25);
	}
</style>
