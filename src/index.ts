import { app, BrowserWindow, ipcMain, protocol, screen, shell } from 'electron'
import { getConfig, saveConfig } from './services/config.service'
import path from 'path'

import chokidar from 'chokidar'

import { loadIPC } from './services/ipc.service'
loadIPC()

import { scanFolders } from './services/indexer.service'
import { createData, getCollection, loadDb, updateData } from './services/loki.service'
import stringHash from 'string-hash'
import { getWatcher, watchFolders } from './services/folderWatcher.service'
import { ConfigType } from './types/config.type'

const collectionName = 'music'

export const appDataPath = path.join(app.getPath('appData'), 'Jahmin')

/*
	New Files: Chokidar files -> If not in db, add them.
	Updated Files: Chokidar files -> If in db and different, update them.

	Deleted Files: DB files -> Check if on system, if not, remove from DB.
*/

async function createWindow() {
	const config = getConfig()

	await loadDb()

	// Create the browser window.
	const window = new BrowserWindow(loadOptions(config))

	window.webContents.openDevTools()
	window.loadFile('index.html')

	if (config?.['rootDirectories']) watchFolders(config['rootDirectories'])

	window.on('resize', () => saveWindowBounds(window)).on('move', () => saveWindowBounds(window))
}

function loadOptions(config: ConfigType) {
	const options = {
		title: 'Jahmin',
		x: 0,
		y: 0,
		width: 800,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			worldSafeExecuteJavaScript: true
		}
	}

	if (config['bounds'] !== undefined) {
		const bounds = config['bounds']

		const area = screen.getDisplayMatching(bounds).workArea

		if (
			bounds.x >= area.x &&
			bounds.y >= area.y &&
			bounds.x + bounds.width <= area.x + area.width &&
			bounds.y + bounds.height <= area.y + area.height
		) {
			options['x'] = bounds['x']
			options['y'] = bounds['y']
		}

		if (bounds.width <= area.width || bounds.height <= area.height) {
			options['height'] = bounds['height']
			options['width'] = bounds['width']
		}
	} else {
		console.log('No Config')
	}

	return options
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('before-quit',()=>{
	getWatcher().close()
})


// process.on('exit',()=>{

// })

app.on('activate', () => {
	// console.log(app.getPath('appData'))
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
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
