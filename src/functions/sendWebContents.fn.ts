import { BrowserWindow } from 'electron'
import { getMainWindow } from '..'

let browserWindow: BrowserWindow | undefined

export function sendWebContents(channel: string, data: any) {
	if (browserWindow === undefined) {
		browserWindow = getMainWindow()
	}

	browserWindow.webContents.send(channel, data)
}
