<script lang="ts">
	import { selectedSongs } from '../store/index.store'
	// import { selectedAlbum } from '../store/player.store'

	let isSelectedSongsFirstAssign = true

	$: {
		if (isSelectedSongsFirstAssign === true) {
			isSelectedSongsFirstAssign = false
		} else {
			console.log($selectedSongs)
			// $selectedSongs
			// checkSongs()
		}
	}

	let previousSongList = undefined
	/*
	function checkSongs() {
		if (!$selectedAlbumId?.Songs) return

		let songs = []

		$selectedSongs.forEach((index) => {
			songs.push($selectedAlbumId.Songs[index])
		})

		if (songs.length === 0) {
			songs = $selectedAlbumId.Songs
		}

		if (JSON.stringify(previousSongList) === JSON.stringify(songs)) {
			return
		} else {
			previousSongList = [...songs]
		}

		console.log(songs)
	}
	*/
</script>

<details-svlt />

<style>
	details-svlt {
		grid-area: details-svlt;
		background-color: rgba(0, 0, 0, 0.25);
	}
</style>
