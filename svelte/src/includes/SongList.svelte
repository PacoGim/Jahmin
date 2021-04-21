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
		if ($songListStore.length - (scrollTime + 1) < SONG_AMOUNT) {
			songsTrimmed = $songListStore.slice($songListStore.length - SONG_AMOUNT)
		} else if (scrollTime >= 0) {
			songsTrimmed = $songListStore.slice(scrollTime, -1).slice(0, SONG_AMOUNT)
		}

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

		if (scrollTime >= $songListStore.length) {
			scrollTime = $songListStore.length
		} else if (scrollTime < 0) {
			scrollTime = 0
		}
	}

	function setProgress() {
		progressValue = ((100 / $songListStore.length) * scrollTime) | 0
		document.documentElement.style.setProperty('--progress-bar-fill', `${progressValue}%`)
	}

	function handleScrollBarEvent(e) {
		console.log(e)
	}

	onMount(() => {
		let songListProgressBar = document.querySelector('song-list-progress-bar')

		//TODO Add Event listeners MouseOver + MouseDown
	})
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
		justify-content: space-evenly;
		padding: 0.5rem;
	}

	song-list-progress-bar {
		cursor: pointer;
		display: block;
		width: 10px;
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
