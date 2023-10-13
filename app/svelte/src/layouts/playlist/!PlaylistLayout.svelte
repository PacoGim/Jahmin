<script lang="ts">
	import PlaylistList from './PlaylistList.svelte'
	import PlaylistSongList from './PlaylistSongList.svelte'

	let playlist = []

	let selectedPlaylistName = undefined
</script>

<playlist-svlt>
	<PlaylistList on:selectedPlaylist={event => (selectedPlaylistName = event.detail)} />
	<PlaylistSongList playlistName={selectedPlaylistName} />
	<!--
    1. List creation
      New playlist
      List 1
      List 2
      List 3

      Right click a list to delete or add a delete button
    2. Songs list
      Shows all the songs in the playlist.
      Use a "moveable" list so the user can move the songs where it wants.
      Double clicking a song should start playing from the song onward. "Of course use the startPlayback fn"
   -->

	<!--
  a playlist is:
    a txt file?

  it stores:
    an ID -> can get the data from the DB
    problem: if the song moved it will be unlinked
    fix: could also store song title, album and artist, and ask, if the song is not found, search for all user song with the stored title, artist and album, if a song is found, let the user choose which one to remplace the not found one with

  playlistName.json ->

  [
    {
      id,
      title,
      album,
      artist
    },
    ...
  ]
 -->
</playlist-svlt>

<style>
	playlist-svlt {
		display: flex;
		flex-direction: row;
	}
</style>
