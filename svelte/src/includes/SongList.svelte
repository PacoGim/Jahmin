<script lang="ts">
	import { onMount } from 'svelte'

	import SongListItem from '../components/SongListItem.svelte'
	import { scrollSongListToTop } from '../functions/scrollSongListToTop.fn'
	import { selectedAlbumId, songListStore, selectedSongsStore } from '../store/final.store'

	let isSelectedAlbumIdFirstAssign = true
	let songsTrimmed = []
	let scrollTime = 0
	let progressValue = 0

	const SONG_AMOUNT = 8

	$: {
		$selectedAlbumId
		if (isSelectedAlbumIdFirstAssign) {
			isSelectedAlbumIdFirstAssign = false
		} else {
			scrollSongListToTop()
			scrollTime = 0
		}
	}

	$: {
		$songListStore
		scrollTime
		trimSongsArray()
	}

	function trimSongsArray() {
		// 1º Slice: Slice array from scrollTime to end. Cuts from array songs already scrolled.
		// 2º Slice: Keep songs from 0 to the set amount.
		songsTrimmed = $songListStore.slice(scrollTime).slice(0, SONG_AMOUNT)

		setProgress()
	}

	let lastSelectedSong = 0

	function selectSongs(e: MouseEvent) {
		let { ctrlKey, metaKey, shiftKey } = e

		e['path'].forEach((element: HTMLElement) => {
			if (element.tagName === 'SONG-LIST-ITEM') {
				let id = Number(element.getAttribute('id'))
				let currentSelectedSong = Number(element.getAttribute('index'))

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
						let currentID = $songListStore[i].ID

						if (!$selectedSongsStore.find((i) => i === currentID)) {
							$selectedSongsStore.push(currentID)
						}
					}
				}

				lastSelectedSong = currentSelectedSong
				$selectedSongsStore = $selectedSongsStore
			}
		})
	}

	function scrollContainer(e: WheelEvent) {
		scrollTime = scrollTime + Math.sign(e.deltaY)

		// Stops scrolling beyond arrays end and always keeps one element visible.
		if (scrollTime >= $songListStore.length - 1) {
			scrollTime = $songListStore.length - 1
		} else if (scrollTime < 0) {
			scrollTime = 0
		}
	}

	function setProgress() {
		progressValue = ((100 / ($songListStore.length - 1)) * scrollTime) | 0
		document.documentElement.style.setProperty('--progress-bar-fill', `${progressValue}%`)
	}

	function handleScrollBarEvent(e) {
		console.log(e)
	}

	let isMouseDown = false
	let isMouseIn = false

	onMount(() => {
		let songListProgressBar: HTMLDivElement = document.querySelector('song-list-progress-bar')

		/*
		document.addEventListener('mousemove', (evt: MouseEvent) => {
			if (isMouseDown) {

				console.log(evt.clientY)
			}
		})
		*/

		songListProgressBar.addEventListener('mouseenter', () => (isMouseIn = true))

		songListProgressBar.addEventListener('mouseleave', () => {
			isMouseIn = false

			// Resets also mouse down if the user leaves the area while holding the mouse down then comes back with mouse up the event would still trigger.
			isMouseDown = false
		})

		songListProgressBar.addEventListener('mousedown', () => (isMouseDown = true))

		songListProgressBar.addEventListener('mouseup', () => (isMouseDown = false))

		songListProgressBar.addEventListener('mousemove', (evt) => {
			if (isMouseDown && isMouseIn) setScrollTime(songListProgressBar, evt)
		})

		songListProgressBar.addEventListener('click', (evt) => setScrollTime(songListProgressBar, evt))

		//TODO Song Playback by ID not index
		//TODO Waveform poping and also add pcm saving
	})

	function setScrollTime(songListProgressBar: HTMLDivElement, e: MouseEvent) {
		console.log(e.clientX)

		let percentClick = (100 / songListProgressBar.clientHeight) * e.offsetY
		scrollTime = ($songListStore.length / 100) * percentClick
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
	}

	song-list {
		display: flex;
		flex-direction: column;
		/* justify-content: space-evenly; */
		padding: 0.5rem;
	}

	song-list-progress-bar {
		cursor: pointer;
		display: block;
		width: 1rem;
		background-color: rgba(255, 255, 255, 0.15);
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
