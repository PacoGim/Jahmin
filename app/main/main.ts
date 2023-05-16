import { app, BrowserWindow, globalShortcut } from 'electron'

import { watch as chokidarWatch } from 'chokidar'

import { getConfig, saveConfig } from './services/config.service'

import getWindowOptionsFn from './functions/getWindowOptions.fn'

import { startIPC } from './services/ipc.service'

import path from 'path'

import calculateWindowBoundariesFn from './functions/calculateWindowBoundaries.fn'
import sendWebContentsFn from './functions/sendWebContents.fn'

let browserWindow: BrowserWindow

chokidarWatch([
	path.join(__dirname, '../svelte'),
	path.join(__dirname, '../index.html'),
	path.join(__dirname, '../assets'),
	path.join(__dirname, './i18n')
]).on('change', () => {
	getMainWindow().reload()
})

app.whenReady().then(() => {
	createWindow()
	startIPC()

	if (getConfig().userOptions.isFullscreen === true) {
		getMainWindow().maximize()
	}

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit()
	})
})

app.on('will-quit', () => {
	// Unregister all shortcuts.
	globalShortcut.unregisterAll()
})

function createWindow() {
	const config = getConfig()

	browserWindow = new BrowserWindow(getWindowOptionsFn(config))

	browserWindow.webContents.openDevTools()

	browserWindow.loadFile(path.join(__dirname, '../index.html'))

	browserWindow
		.on('move', () => calculateWindowBoundariesFn(browserWindow))
		.on('resize', () => calculateWindowBoundariesFn(browserWindow))
		.on('maximize', () => {
			saveConfig({
				userOptions: {
					isFullscreen: true
				}
			})
		})
		.on('unmaximize', () => {
			saveConfig({
				userOptions: {
					isFullscreen: false
				}
			})
		})
}

export function getMainWindow() {
	return browserWindow
}
