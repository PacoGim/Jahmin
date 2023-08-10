import lyricsContainerCtxMenu from './lyricsContainerCtxMenu'
import albumContextMenu from './albumCtxMenu'
import groupNameCtxMenu from './groupNameCtxMenu'
import songListCtxMenu from './songListCtxMenu'

export async function handleContextMenuEvent(e: MouseEvent) {
	e.preventDefault()

	const pathsName = e.composedPath().map((path: HTMLElement) => path.tagName)

	if (pathsName.includes('ALBUM')) albumContextMenu(e)

	if (pathsName.includes('SONG-LIST-SVLT')) songListCtxMenu(e)

	if (pathsName.includes('GROUP-NAME')) groupNameCtxMenu(e)

	if (pathsName.includes('LYRICS-CONTAINER')) lyricsContainerCtxMenu(e)
}
