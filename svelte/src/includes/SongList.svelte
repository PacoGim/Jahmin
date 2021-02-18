<script lang="ts">
	import SongListItem from '../components/SongListItem.svelte'
	import { selectedSongs } from '../store/index.store'

	import { selectedAlbum } from '../store/player.store'

	let lastSelectedSong = 0

	function selectSongs(e: MouseEvent) {
		let { ctrlKey, metaKey, shiftKey } = e

		e['path'].forEach((element: HTMLElement) => {
			if (element.tagName === 'SONG-LIST-ITEM') {
				let index = Number(element.getAttribute('index'))

				if (ctrlKey === false && metaKey === false && shiftKey === false) {
					$selectedSongs = [index]
				}

				if (ctrlKey === true || metaKey === true) {
					let foundSong = $selectedSongs.find((i) => i === index)

					if (!foundSong) {
						$selectedSongs.push(index)
					} else {
						$selectedSongs.splice($selectedSongs.indexOf(index), 1)
					}
				}

				if (shiftKey === true && ctrlKey === false && metaKey === false) {
					for (let i = index; i !== lastSelectedSong; index < lastSelectedSong ? i++ : i--) {
						$selectedSongs.push(i)
					}
				}

				lastSelectedSong = index
				$selectedSongs = $selectedSongs
			}
		})
	}
</script>

<song-list-svlt on:click={(e) => selectSongs(e)}>
	{#if $selectedAlbum !== undefined}
		{#if $selectedAlbum['Songs'] !== undefined}
			{#each $selectedAlbum['Songs'] as song, index (index)}
				<SongListItem albumID={$selectedAlbum['ID']} {song} {index} />
			{/each}
		{/if}
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
