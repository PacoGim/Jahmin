<script lang="ts">
	import SongListItem from '../../components/SongListItem.svelte'
	import songListClickEventHandlerService from '../../services/songListClickEventHandler.service'

	import { songAmountConfig } from '../../store/config.store'

	import { selectedAlbumDir, songListStore, triggerScrollToSongEvent } from '../../store/final.store'
	import SongListScrollBar from '../components/SongListScrollBar.svelte'

	let songsToShow = []
	let scrollAmount = 0
	let previousScrollAmount = undefined

	$: {
		$selectedAlbumDir
		previousScrollAmount = undefined
		setScrollAmount(0)
	}

	// Main Song List refresh trigger
	$: {
		$songListStore
		$songAmountConfig
		previousScrollAmount = undefined
		trimSongArray()
	}

	$: {
		changeSongListHeight($songAmountConfig)
	}

	$: {
		if ($triggerScrollToSongEvent !== 0) {
			setScrollAmountFromSong($triggerScrollToSongEvent)
			$triggerScrollToSongEvent = 0
		}
	}

	// Trims the current song array to show a limited amount of songs.
	function trimSongArray() {
		if (scrollAmount !== previousScrollAmount) {
			songsToShow = $songListStore.slice(scrollAmount, scrollAmount + $songAmountConfig)

			if (songsToShow.length > 0) {
				previousScrollAmount = scrollAmount
			}
		}
	}

	function setScrollAmount(amount) {
		if (amount <= 0) {
			amount = 0
		} else if (amount > $songListStore.length - 1) {
			amount = $songListStore.length - 1
		}

		scrollAmount = amount

		trimSongArray()

		setScrollProgress()
	}

	function onSongListBarScrolled(event) {
		setScrollAmount(event.detail)
	}

	function setScrollProgress() {
		let scrollValue = ((100 / ($songListStore.length - 1)) * scrollAmount) | 0
		document.documentElement.style.setProperty('--scrollbar-fill', `${scrollValue}%`)
	}

	function changeSongListHeight(songAmount) {
		document.documentElement.style.setProperty('--song-list-svlt-height', `${songAmount * 36 + 16}px`)
	}

	function scrollContainer(e: WheelEvent) {
		setScrollAmount(scrollAmount + Math.sign(e.deltaY))
	}

	// Manages to "scroll" to the proper song on demand.
	function setScrollAmountFromSong(songId) {
		let songIndex = $songListStore.findIndex(song => song.ID === songId)

		let differenceAmount = Math.floor($songAmountConfig / 2)

		if (songIndex !== -1) {
			if (songIndex < differenceAmount) {
				setScrollAmount(0)
			} else {
				setScrollAmount(songIndex - differenceAmount)
			}
		}
	}
</script>

<song-list-svlt on:mousewheel={e => scrollContainer(e)} on:click={e => songListClickEventHandlerService(e)}>
	<song-list>
		{#each songsToShow as song, index (song.ID)}
			<SongListItem {song} {index} />
		{/each}
	</song-list>
	<SongListScrollBar on:songListBarScrolled={onSongListBarScrolled} />
</song-list-svlt>

<style>
	song-list-svlt {
		color: #fff;
		grid-area: song-list-svlt;
		display: grid;
		grid-template-columns: auto max-content;
		z-index: 2;
	}

	song-list {
		padding: 8px;
	}
</style>
