export default function (e: MouseEvent) {
	let element = e.target as HTMLElement

	let lyricsContainer = element.closest('lyrics-container') as HTMLElement

	let data = lyricsContainer.dataset

	window.ipc.showContextMenu('LyricsContainerContextMenu', data)
}
