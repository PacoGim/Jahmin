import { get } from 'svelte/store'
import { activeSongStore, selectedAlbumDir, selectedSongsStore } from '../../stores/main.store'
import bulkGetSongsFn from '../../db/bulkGetSongs.fn'

export default async function (e: MouseEvent) {
	let clickedSongItem: HTMLElement = e
		.composedPath()
		.find((path: HTMLElement) => path.tagName === 'SONG-LIST-ITEM') as HTMLElement

	let clickedSongId = clickedSongItem?.dataset.id
	let clickedSongData = undefined

	let selectedSongsId: number[] = get(selectedSongsStore)
	let selectedSongsData = []

	if (clickedSongId) {
		activeSongStore.set(Number(clickedSongId))
		clickedSongData = await bulkGetSongsFn([Number(clickedSongId)])
		clickedSongData = clickedSongData[0]
	}

	selectedSongsData = await bulkGetSongsFn(selectedSongsId)

	window.ipc.showContextMenu('SongListContextMenu', {
		albumRootDir: get(selectedAlbumDir),
		selectedSongsData,
		clickedSongData: clickedSongData
	})
}
