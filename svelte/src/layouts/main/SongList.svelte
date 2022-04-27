<script lang="ts">
	import SongListItem from '../../components/SongListItem.svelte'

	import sortSongsArrayFn from '../../functions/sortSongsArray.fn'

	import { songAmountConfig, sortByConfig, sortOrderConfig } from '../../store/config.store'

	import { songListStore } from '../../store/final.store'
	import SongListScrollBar from '../components/SongListScrollBar.svelte'

	let songsToShow = []
	let scrollAmount = 0

	// Main Song List refresh trigger
	$: {
		$songListStore
		scrollAmount
		trimSongArray()
	}

	// Trims the current song array to show a limited amount of songs.
	function trimSongArray() {
		songsToShow = sortSongsArrayFn($songListStore, $sortByConfig, $sortOrderConfig).slice(
			scrollAmount,
			scrollAmount + $songAmountConfig
		)
	}

	function setScrollAmount(amount) {
		scrollAmount = amount

		setScrollProgress()
	}

	function onSongListBarScrolled(event) {
		setScrollAmount(event.detail)
	}

	function setScrollProgress() {
		let scrollValue = ((100 / ($songListStore.length - 1)) * scrollAmount) | 0
		document.documentElement.style.setProperty('--scrollbar-fill', `${scrollValue}%`)
	}
</script>

<song-list-svlt>
	<song-list>
		{#each songsToShow as song, index (song.ID)}
			<SongListItem {song} {index} />
		{/each}
	</song-list>
	<SongListScrollBar on:songListBarScrolled={onSongListBarScrolled} />
</song-list-svlt>

<style>
	/* Items are 30px min and max */
	song-list-svlt {
		color: #fff;
		grid-area: song-list-svlt;
		display: grid;
		grid-template-columns: auto max-content;
		z-index: 2;

		/* border: 4px var(--high-color) solid; */
		/* border-bottom: none; */

		/* transition: border 300ms linear; */
	}

	song-list {
		/* display: flex; */
		/* flex-direction: column; */
		/* justify-content: space-evenly; */
		padding: 8px;

		/* min-height: auto; */

		/* transition: all 1000ms ease-in-out; */
	}
</style>
