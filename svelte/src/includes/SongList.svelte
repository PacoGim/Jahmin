<script lang="ts">
	import { onMount } from 'svelte'

	import SongListItem from '../components/SongListItem.svelte'
	import {
		selectedAlbumId,
		songListStore,
		selectedSongsStore,
		triggerScrollToSongEvent,
		playingSongStore
	} from '../store/final.store'

	let isSelectedAlbumIdFirstAssign = true
	let songsTrimmed = []
	let scrollAmount = 0
	let progressValue = 0
	let lastSelectedSong = 0
	let isScrollAtBottom = false
	let isScrollAtTop = false
	const SONG_AMOUNT = 8

	// Keeps track of the max size of the song list element.
	let maxSongListHeight = 0

	$: {
		$songListStore
		setMaxSongListHeight()
		trimSongsArray()
	}

	$: {
		// When new album selected, reset scroll to 0 (to be on top of scroll) and reset scroll edges checks.
		$selectedAlbumId
		if (isSelectedAlbumIdFirstAssign) {
			isSelectedAlbumIdFirstAssign = false
		} else {
			setScroll(0)
			isScrollAtBottom = false
			isScrollAtTop = false
		}
	}

	$: {
		if ($triggerScrollToSongEvent === true) {
			setScrollAmountFromSong($playingSongStore.ID)
			isScrollAtBottom = false
			isScrollAtTop = false
			$triggerScrollToSongEvent = false
		}
	}

	$: {
		// Trim array of songs when the user scrolls.
		scrollAmount
		trimSongsArray()
	}

	function setScroll(value: number) {
		scrollAmount = value
	}

	function setMaxSongListHeight() {
		// This allows, based on the SONG_AMOUNT set by user or the default value, to dynamically keep the biggest auto sizing of the element allowing to have song lists with very few songs to fit properly on the same element with a lot of songs. It prevents jumps if the list of songs is too small after a big list of songs.

		/*
				| Song 1 |		->			| Song 1 |
				| Song 2 |		->			| Song 2 |
				| Song 3 |		->			| 			 |
				| Song 4 |		->			| 			 |
		*/

		let songList = document.querySelector('song-list')

		if (songList) {
			if (songList.clientHeight > maxSongListHeight) {
				maxSongListHeight = songList.clientHeight
				document.documentElement.style.setProperty('--song-list-svlt-height', `${songList.clientHeight}px`)
			}
		}
	}

	function trimSongsArray() {
		if (isScrollAtBottom === false && isScrollAtTop === false) {
			// 1º Slice: Slice array from scrollAmount to end. Cuts from array songs already scrolled.
			// 2º Slice: Keep songs from 0 to the set amount.
			songsTrimmed = $songListStore.slice(scrollAmount).slice(0, SONG_AMOUNT)
		}

		setProgress()
	}

	function selectSongs(e: MouseEvent) {
		let { ctrlKey, metaKey, shiftKey } = e

		e['path'].forEach((element: HTMLElement) => {
			if (element.tagName === 'SONG-LIST-ITEM') {
				let id = Number(element.getAttribute('id'))
				let currentSelectedSong = $songListStore.findIndex((song) => song.ID === Number(element.getAttribute('id')))

				if (ctrlKey === false && metaKey === false && shiftKey === false) {
					$selectedSongsStore = [id]
				}

				if (shiftKey === false && (ctrlKey === true || metaKey === true)) {
					if (!$selectedSongsStore.includes(id)) {
						$selectedSongsStore.push(id)
					} else {
						$selectedSongsStore.splice($selectedSongsStore.indexOf(id), 1)
					}
				}

				if (shiftKey === true && ctrlKey === false && metaKey === false) {
					for (let i = currentSelectedSong; i !== lastSelectedSong; currentSelectedSong < lastSelectedSong ? i++ : i--) {
						let currentId = $songListStore[i].ID

						if (!$selectedSongsStore.find((i) => i === currentId)) {
							$selectedSongsStore.push(currentId)
						}
					}
				}

				lastSelectedSong = currentSelectedSong
				$selectedSongsStore = $selectedSongsStore
			}
		})
	}

	function scrollContainer(e: WheelEvent) {
		setScroll(scrollAmount + Math.sign(e.deltaY))

		// Stops scrolling beyond arrays end and always keeps one element visible.
		if (scrollAmount === $songListStore.length) {
			setScroll($songListStore.length - 1)
			isScrollAtBottom = true
		} else if (scrollAmount < 0) {
			setScroll(0)
			isScrollAtTop = true
		} else {
			isScrollAtBottom = false
			isScrollAtTop = false
		}
	}

	function setProgress() {
		progressValue = ((100 / ($songListStore.length - 1)) * scrollAmount) | 0
		document.documentElement.style.setProperty('--progress-bar-fill', `${progressValue}%`)
	}

	let isMouseDownInScroll = false

	onMount(() => {
		// Set an approximate value on how high would the song list container be to prevent
		document.documentElement.style.setProperty('--song-list-svlt-height', `${SONG_AMOUNT * 30}px`)

		scrollBarHandler()

		let lastPlayedSongId = Number(localStorage.getItem('LastPlayedSongId'))

		setTimeout(() => {
			setScrollAmountFromSong(lastPlayedSongId)
		}, 250)
	})

	/*
			User clicks on image
			sets proper category
			scrolls to song
	*/

	// Manages to "scroll" to the proper song on demand.
	function setScrollAmountFromSong(songId) {
		let songIndex = $songListStore.findIndex((song) => song.ID === songId)
		let differenceAmount = Math.floor(SONG_AMOUNT / 2)

		if (songIndex !== -1) {
			if (songIndex < differenceAmount) {
				setScroll(0)
			} else {
				setScroll(songIndex - differenceAmount)
			}
		}
	}

	// Sets the proper scrollAmount based of the percentage (in distance) of the bar clicked. 0% = top and 100% = bottom.
	function setScrollAmountBar(songListProgressBar: HTMLDivElement, e: MouseEvent) {
		let percentClick = (100 / songListProgressBar.clientHeight) * e.offsetY
		setScroll(($songListStore.length / 100) * percentClick)
	}

	function isValidPath(event: Event, validPaths: string[]) {
		return event
			.composedPath() // Return back an array of all elements clicked.
			.map((path: HTMLElement) => path.tagName) // Gives only the tag name of the elements.
			.find((tag) => validPaths.includes(tag)) // If the tag name matches the array of valid values.
	}

	function scrollBarHandler() {
		let songListProgressBar: HTMLDivElement = document.querySelector('song-list-progress-bar')

		// Handles moving the cursor over the "scrollbar" then moving out of it so the "scrolling" does not stop abruptly.
		document.addEventListener('mousemove', (e: MouseEvent) => {
			// Checks if the other event triggered a mouse down on the "scrollbar".
			if (isMouseDownInScroll) {
				// Returns the position (top and height) on screen of the "scrollbar".
				let { top, height } = songListProgressBar.getBoundingClientRect()

				// Calculates the difference between the current cursor position on screen relative to the "scrollbar".
				let difference = e.clientY - top

				// Calculates the percentage of scroll.
				// 0% and lower would mean that the cursor is at the top and beyond the scrollbar.
				// 100% and above would mean that the cursor is at the bottom and beyond the scrollbar.
				let percentage = (100 / height) * difference

				// If the percent is higher than 100% block the percent to 100%.
				if (percentage >= 100) {
					percentage = 100
					// If the percent is lower than 0% block the percent to 0%.
				} else if (percentage <= 0) {
					percentage = 0
				}

				// Sets the scrollAmount value with the newly calculated one.
				setScroll((($songListStore.length - 1) / 100) * percentage)
			}
		})

		// If the user clicks on either the scroll bar or the progress fill, set isMouseDownInScroll to true.
		document.addEventListener('mousedown', (e) => {
			if (isValidPath(e, ['SONG-LIST-PROGRESS-BAR', 'PROGRESS-FILL'])) {
				isMouseDownInScroll = true
			}
		})

		// Anywhere the user releases the mouse button, set isMouseDownInScroll to false.
		document.addEventListener('mouseup', () => {
			isMouseDownInScroll = false
		})

		// If the user click on the scrollbar, calls setScrollAmountBar.
		songListProgressBar.addEventListener('click', (evt) => setScrollAmountBar(songListProgressBar, evt))
	}
</script>

<song-list-svlt on:mousewheel={(e) => scrollContainer(e)} on:click={(e) => selectSongs(e)}>
	<song-list>
		{#if $songListStore !== undefined}
			{#each songsTrimmed as song, index (song.ID)}
				<SongListItem {song} {index} />
			{/each}
		{/if}
	</song-list>
	<song-list-progress-bar>
		<progress-fill />
	</song-list-progress-bar>
</song-list-svlt>

<style>
	song-list-svlt {
		grid-area: song-list-svlt;
		display: grid;
		grid-template-columns: auto max-content;
		z-index: 2;

		/* transition: all 1000ms ease-in-out; */
	}

	song-list {
		/* display: flex; */
		/* flex-direction: column; */
		/* justify-content: space-evenly; */
		padding: 8px;

		/* min-height: auto; */

		/* transition: all 1000ms ease-in-out; */
	}

	song-list-progress-bar {
		display: block;
		width: 1rem;
		background-color: rgba(255, 255, 255, 0.15);

		cursor: grab;
	}
	song-list-progress-bar:active {
		cursor: grabbing;
	}

	song-list-progress-bar progress-fill {
		display: block;
		width: auto;
		background-color: rgba(255, 255, 255, 0.5);
		height: var(--progress-bar-fill);
		border-bottom: 5px solid rgba(255, 255, 255, 0.75);
		max-height: 100%;
	}
</style>
