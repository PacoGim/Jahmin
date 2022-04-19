import { app, BrowserWindow, ipcMain, screen, shell, globalShortcut } from 'electron'

import path from 'path'

export const appDataPath = () => path.join(app.getPath('appData'), 'Jahmin')

import { getConfig, saveConfig } from './services/config.service'

import { initWorkers, killAllWorkers } from './services/worker.service'
initWorkers()

import { loadIPC } from './services/ipc.service'
loadIPC()

import { initStorage, killStorageWatcher } from './services/storage.service'

import { getRootDirFolderWatcher, watchFolders } from './services/songSync.service'
import { ConfigType } from './types/config.type'

import chokidar from 'chokidar'

let browserWindow: BrowserWindow

// Watches for changes in svelte build folder and reloads the window. Kinda hot reload-ish. Works Great!
chokidar.watch(path.join(__dirname, './build/bundle.js')).on('change', path => {
	getMainWindow().reload()
})

async function createMainWindow() {
	const config = getConfig()

	// Create the browser window.
	browserWindow = new BrowserWindow(loadOptions(config))

	browserWindow.webContents.openDevTools()
	browserWindow.loadFile('index.html')
	// Gets the storage data from files and creates a map.
	initStorage()

	browserWindow.on('resize', () => saveWindowBounds(browserWindow)).on('move', () => saveWindowBounds(browserWindow))
}

function loadOptions(config: ConfigType) {
	const options = {
		title: 'Jahmin',
		x: 0,
		y: 0,
		width: 800,
		height: 800,
		backgroundColor: '#1c2128',
		webPreferences: {
			nodeIntegration: true,
			worldSafeExecuteJavaScript: true,
			contextIsolation: false,
			enableRemoteModule: true
		}
	}

	if (config.bounds !== undefined) {
		const bounds = config.bounds

		const area = screen.getDisplayMatching(bounds).workArea

		if (
			bounds.x >= area.x &&
			bounds.y >= area.y &&
			bounds.x + bounds.width <= area.x + area.width &&
			bounds.y + bounds.height <= area.y + area.height
		) {
			options.x = bounds.x
			options.y = bounds.y
		} else {
			options.x = 0
			options.y = 0
		}

		if (bounds.width <= area.width && bounds.height <= area.height && bounds.height >= 500 && bounds.width >= 500) {
			options.height = bounds.height
			options.width = bounds.width
		}
	}

	return options
}

export function getMainWindow() {
	return browserWindow
}

app.on('ready', createMainWindow)

app.whenReady().then(() => {
	globalShortcut.register('CommandOrControl+R', () => {
		console.log('CommandOrControl+R is pressed: Shortcut Disabled')
		app.relaunch()
		app.quit()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('before-quit', () => {
	killAllWorkers()
	killStorageWatcher()
	getRootDirFolderWatcher()?.close()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow()
	}
})

let saveConfigDebounce: NodeJS.Timeout

function saveWindowBounds(window: BrowserWindow) {
	if (saveConfigDebounce) clearTimeout(saveConfigDebounce)

	saveConfigDebounce = setTimeout(() => {
		saveConfig({
			bounds: {
				x: window.getPosition()[0],
				y: window.getPosition()[1],
				width: window.getSize()[0],
				height: window.getSize()[1]
			}
		})
	}, 250)
}
