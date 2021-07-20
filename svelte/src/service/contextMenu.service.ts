import { showContextMenuIPC } from './ipc.service'

export function handleContextMenuEvent(e: MouseEvent) {
	e.preventDefault()

	const pathsName = e.composedPath().map((path: HTMLElement) => path.tagName)

	if (pathsName.includes('ALBUM')) {
		let albumElement: HTMLElement = e.composedPath().find((path: HTMLElement) => path.tagName === 'ALBUM') as HTMLElement

		let albumId = albumElement.getAttribute('id')

		showContextMenuIPC(
			'AlbumContextMenu',
			JSON.stringify({
				albumId
			})
		)
	}
}
