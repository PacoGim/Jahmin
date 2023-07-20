import { get } from 'svelte/store'
import { activeSongStore, selectedAlbumDir, selectedSongsStore } from '../../stores/main.store'

export default async function (e: MouseEvent) {
	let clickedSongItem: HTMLElement = e
		.composedPath()
		.find((path: HTMLElement) => path.tagName === 'SONG-LIST-ITEM') as HTMLElement

	let clickedSongId = Number(clickedSongItem?.dataset.id)

	let selectedSongsId: number[] = get(selectedSongsStore)

	if (clickedSongId) activeSongStore.set(clickedSongId)

	window.ipc.showContextMenu('SongListContextMenu', {
		albumRootDir: get(selectedAlbumDir),
		selectedSongsId,
		clickedSongId
	})
}
