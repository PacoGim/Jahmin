import { showContextMenuIPC } from './ipc.service'
import { activeSongStore, selectedAlbumDir, selectedAlbumId, selectedSongsStore } from '../store/final.store'
import { bulkGetSongs } from '../db/db'

export async function handleContextMenuEvent(e: MouseEvent) {
	e.preventDefault()

	const pathsName = e.composedPath().map((path: HTMLElement) => path.tagName)

	if (pathsName.includes('ALBUM')) {
		let albumElement: HTMLElement = e.composedPath().find((path: HTMLElement) => path.tagName === 'ALBUM') as HTMLElement

		let albumRootDir = albumElement.getAttribute('rootDir')

		showContextMenuIPC('AlbumContextMenu', {
			albumRootDir
		})
	}

	if (pathsName.includes('SONG-LIST')) {
		let clickedSongItem: HTMLElement = e
			.composedPath()
			.find((path: HTMLElement) => path.tagName === 'SONG-LIST-ITEM') as HTMLElement

		let clickedSongId = clickedSongItem?.dataset.id
		let clickedSongData = undefined

		let albumRootDir
		let selectedSongsId: number[]
		let selectedSongsData = []

		selectedAlbumDir.subscribe(_ => (albumRootDir = _))()
		selectedSongsStore.subscribe(_ => (selectedSongsId = _))()

		if (clickedSongId) {
			activeSongStore.set(Number(clickedSongId))
			clickedSongData = await bulkGetSongs([Number(clickedSongId)])
			clickedSongData = clickedSongData[0]
		}

		selectedSongsData = await bulkGetSongs(selectedSongsId)

		showContextMenuIPC('SongListContextMenu', {
			albumRootDir,
			selectedSongsData,
			clickedSongData: clickedSongData
		})
	}

	if (pathsName.includes('GROUP-NAME')) {
		let groupNameElement: HTMLElement = e
			.composedPath()
			.find((path: HTMLElement) => path.tagName === 'GROUP-NAME') as HTMLElement

		let groupName = groupNameElement.dataset.name
		let index = groupNameElement.dataset.index

		showContextMenuIPC('GroupNameContextMenu', {
			groupName,
			index
		})
	}
}
