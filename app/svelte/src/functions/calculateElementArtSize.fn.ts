export default function (element, { keepSquare }: { keepSquare: boolean }) {
	let parentElementSize = element.getBoundingClientRect()
	let height = parentElementSize.height
	let width = parentElementSize.width

	if (keepSquare) {
		if (height === 0) {
			height = width
		} else if (width === 0) {
			width = height
		}
	}

	return {
		height,
		width
	}
}
