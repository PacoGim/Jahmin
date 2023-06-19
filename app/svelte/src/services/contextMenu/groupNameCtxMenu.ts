export default function (e:MouseEvent) {
	let groupNameElement: HTMLElement = e.composedPath().find((path: HTMLElement) => path.tagName === 'GROUP-NAME') as HTMLElement

	let groupName = groupNameElement.dataset.name
	let index = groupNameElement.dataset.index

	window.ipc.showContextMenu('GroupNameContextMenu', {
		groupName,
		index
	})
}
