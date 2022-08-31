import { BrowserWindow, screen } from 'electron'

import fixWindowBoundariesFn from './fixWindowBoundaries.fn'
import saveWindowResizeFn from './saveWindowResize.fn'

let processDebounce: NodeJS.Timeout

export default function (browserWindow: BrowserWindow) {
	clearTimeout(processDebounce)

	processDebounce = setTimeout(() => {
		let x = browserWindow.getPosition()[0]
		let y = browserWindow.getPosition()[1]
		let width = browserWindow.getSize()[0]
		let height = browserWindow.getSize()[1]

		let workArea = screen.getDisplayMatching({
			x,
			y,
			width,
			height
		}).workArea

		saveWindowResizeFn(fixWindowBoundariesFn({ x, y, height, width }, workArea))
	}, 1000)
}
