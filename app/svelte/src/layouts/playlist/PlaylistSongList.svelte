<script lang="ts">
	export let playlistName = undefined

	$: if (playlistName) fetchPlaylistSongs(playlistName)

	function fetchPlaylistSongs(playlistName: string) {
		console.log(playlistName)
	}
</script>

<playlist-song-list-svlt>
	<h1>song list</h1>
</playlist-song-list-svlt>

<style>
</style>
