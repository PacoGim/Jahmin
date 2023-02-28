import bulkGetSongsFn from '../db/bulkGetSongs.fn'
import { activeSongStore, selectedAlbumDir, selectedAlbumsDir, selectedSongsStore, songListStore } from '../stores/main.store'

export async function handleContextMenuEvent(e: MouseEvent) {
	e.preventDefault()

	const pathsName = e.composedPath().map((path: HTMLElement) => path.tagName)

	if (pathsName.includes('ALBUM')) {
		let albumElement: HTMLElement = e.composedPath().find((path: HTMLElement) => path.tagName === 'ALBUM') as HTMLElement

		let albumRootDir = albumElement.getAttribute('rootDir')

		let songListStoreLocal = undefined
		let selectedAlbumsDirLocal = undefined

		songListStore.subscribe(value => (songListStoreLocal = value))()
		selectedAlbumsDir.subscribe(value => (selectedAlbumsDirLocal = value))()

		window.ipc.showContextMenu('AlbumContextMenu', {
			albumRootDir,
			selectedAlbumsDir: selectedAlbumsDirLocal,
			songList: songListStoreLocal
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
			clickedSongData = await bulkGetSongsFn([Number(clickedSongId)])
			clickedSongData = clickedSongData[0]
		}

		selectedSongsData = await bulkGetSongsFn(selectedSongsId)

		window.ipc.showContextMenu('SongListContextMenu', {
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

		window.ipc.showContextMenu('GroupNameContextMenu', {
			groupName,
			index
		})
	}
}
