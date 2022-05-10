import { showContextMenuIPC } from './ipc.service'
import { selectedAlbumDir, selectedAlbumId, selectedSongsStore } from '../store/final.store'

export function handleContextMenuEvent(e: MouseEvent) {
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
		let clickedSongItem: HTMLElement = e.composedPath().find((path: HTMLElement) => path.tagName === 'SONG-LIST-ITEM') as HTMLElement

		let clickedSongId = +clickedSongItem.dataset.id

		let albumRootDir
		let selectedSongs

		selectedAlbumDir.subscribe(_ => (albumRootDir = _))()
		selectedSongsStore.subscribe(_ => (selectedSongs = _))()

		if (selectedSongs.length === 0) {
			selectedSongs = [clickedSongId]
		}

		showContextMenuIPC('SongListContextMenu', {
			albumRootDir,
			selectedSongs
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
