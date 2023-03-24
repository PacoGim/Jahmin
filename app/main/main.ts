import { app, BrowserWindow } from 'electron'

import { watch as chokidarWatch } from 'chokidar'

import { getConfig } from './services/config.service'

import getWindowOptionsFn from './functions/getWindowOptions.fn'

import { startIPC } from './services/ipc.service'

import path from 'path'

import calculateWindowBoundariesFn from './functions/calculateWindowBoundaries.fn'

let browserWindow: BrowserWindow

chokidarWatch([
	path.join(__dirname, '../svelte'),
	path.join(__dirname, '../index.html'),
	path.join(__dirname, '../assets'),
	path.join(__dirname, './i18n')
]).on('change', () => {
	getMainWindow().reload()
})

function createWindow() {
	const config = getConfig()

	browserWindow = new BrowserWindow(getWindowOptionsFn(config))

	browserWindow.webContents.openDevTools()

	browserWindow.loadFile(path.join(__dirname, '../index.html'))

	browserWindow
		.on('move', () => calculateWindowBoundariesFn(browserWindow))
		.on('resize', () => calculateWindowBoundariesFn(browserWindow))
}

app.whenReady().then(() => {
	createWindow()
	startIPC()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit()
	})
})

export function getMainWindow() {
	return browserWindow
}
