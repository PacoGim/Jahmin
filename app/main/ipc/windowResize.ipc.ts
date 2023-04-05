import { BrowserWindow, IpcMainEvent } from 'electron'
import { saveConfig } from '../services/config.service'

let saveConfigDebounce: NodeJS.Timeout

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('window-resize', event => windowResize(event))
}

function windowResize(event: IpcMainEvent) {
	let window = BrowserWindow.fromId(event.frameId)

	if (window === null) return

	clearTimeout(saveConfigDebounce)

	console.log(window.isFullScreen())

	saveConfigDebounce = setTimeout(() => {
		saveConfig({
			bounds: {
				x: window!.getPosition()[0],
				y: window!.getPosition()[1],
				width: window!.getSize()[0],
				height: window!.getSize()[1]
			}
		})
	}, 250)
}
