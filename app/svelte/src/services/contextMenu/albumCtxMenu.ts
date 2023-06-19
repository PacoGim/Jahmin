import { get } from 'svelte/store'
import { keyModifier, selectedAlbumsDir, songListStore } from '../../stores/main.store'

export default function (e: MouseEvent) {
	let albumElement: HTMLElement = e.composedPath().find((path: HTMLElement) => path.tagName === 'ALBUM') as HTMLElement

	let albumRootDir = albumElement.getAttribute('rootDir')

	window.ipc.showContextMenu('AlbumContextMenu', {
		albumRootDir,
		selectedAlbumsDir: get(selectedAlbumsDir),
		songList: get(songListStore),
		keyModifier: get(keyModifier)
	})

	keyModifier.set(undefined)
}
