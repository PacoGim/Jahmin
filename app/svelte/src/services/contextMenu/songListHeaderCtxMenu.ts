export default async function (e: MouseEvent) {
	window.ipc.showContextMenu('SongListHeaderContextMenu', {})
}
