import lyricsContainerCtxMenu from './lyricsContainerCtxMenu'
import albumContextMenu from './albumCtxMenu'
import groupNameCtxMenu from './groupNameCtxMenu'
import songListCtxMenu from './songListCtxMenu'
import path from 'path'
import songListHeaderCtxMenu from './songListHeaderCtxMenu'

export async function handleContextMenuEvent(e: MouseEvent) {
	e.preventDefault()

	//In the context of a DOM event, these EventTarget objects are typically Node objects, and more specifically HTMLElement objects.
	const pathsName = e.composedPath().map((path: EventTarget) => (path as HTMLElement).tagName)

	if (pathsName.includes('ALBUM')) albumContextMenu(e)

	if (pathsName.includes('SONG-LIST-SVLT') && pathsName.includes('DATA-ROW')) {
		if (pathsName.includes('DATA-BODY')) {
			songListCtxMenu(e)
		} else if (pathsName.includes('DATA-HEADER')) {
			songListHeaderCtxMenu(e)
		}
	}

	if (pathsName.includes('GROUP-NAME')) groupNameCtxMenu(e)

	if (pathsName.includes('LYRICS-CONTAINER')) lyricsContainerCtxMenu(e)
}
