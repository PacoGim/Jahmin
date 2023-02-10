import { BrowserWindow } from 'electron'
import { getMainWindow } from '../main'

let browserWindow: BrowserWindow | undefined

export default function (channel: string, data: any) {
	if (browserWindow === undefined) {
		browserWindow = getMainWindow()
	}

	try {
		browserWindow?.webContents.send(channel, data)
	} catch (error) {}
}
