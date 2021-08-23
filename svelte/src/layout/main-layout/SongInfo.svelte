<script lang="ts">
	import { playingSongStore } from '../../store/final.store'

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
		background-color: var(--high-color);
		color: var(--low-color);
		grid-area: song-info-svlt;
    text-align: right;
	}

	p {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
