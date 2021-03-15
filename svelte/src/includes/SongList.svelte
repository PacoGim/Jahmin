<script lang="ts">
	import SongListItem from '../components/SongListItem.svelte'
	import { scrollSongListToTop } from '../functions/scrollSongListToTop.fn'
	import { selectedAlbumId, songListStore, selectedSongsStore } from '../store/final.store'

	let isSelectedAlbumIdFirstAssign = true

	$: {
		$selectedAlbumId
		if (isSelectedAlbumIdFirstAssign) {
			isSelectedAlbumIdFirstAssign = false
		} else {
			scrollSongListToTop()
		}
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
</script>

<song-list-svlt on:click={(e) => selectSongs(e)}>
	{#if $songListStore !== undefined}
		{#each $songListStore as song, index (song.ID)}
			<SongListItem {song} {index} />
		{/each}
	{/if}
</song-list-svlt>

<style>
	song-list-svlt {
		border: 10px transparent solid;
		grid-area: song-list-svlt;
		overflow-y: auto;
		height: 100%;
		padding-right: 10px;
		/* background-color: rgba(255,255,255,.20); */
	}
</style>
