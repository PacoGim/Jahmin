<script lang="ts">


	let currentSong = ''

	function setSong(song) {
		let audioPlayer = document.querySelector('audio')

		audioPlayer.volume = 0.1
		currentSong = song['SourceFile']

		audioPlayer.addEventListener('loadeddata', () => {
			audioPlayer.play()
		})
	}


</script>

<!-- <audio controls src={currentSong}>
	<track kind="captions" />
</audio> -->

<!-- {#each filesIndex as song, index (index)}
	<div on:dblclick={() => setSong(song)}>{song['Title']}</div>
{/each} -->
