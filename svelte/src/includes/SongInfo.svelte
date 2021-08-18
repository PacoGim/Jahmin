<script>
	import { playingSongStore } from '../store/final.store'

	let playingSong = {
		Album: '',
		Artist: '',
		Title: ''
	}

	$: {
		if ($playingSongStore) {
			playingSong = $playingSongStore
		}
	}
</script>

<song-info-svlt>
	<p>{playingSong.Title}</p>
</song-info-svlt>

<style>
	song-info-svlt {
		grid-area: song-info-svlt;
    text-align: right;
	}
</style>
