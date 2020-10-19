import { app, BrowserWindow, ipcMain, protocol, screen, shell } from 'electron'
import { loadConfig, saveConfig } from './services/config.service'

import { scanFolders } from './services/indexer.service'
import { createFilesIndex, index } from './services/knotdb.service'

const collectionName = 'music'

function createWindow() {
	const config = loadConfig(app)

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

	// Create the browser window.
	const window = new BrowserWindow(options)

	window.webContents.openDevTools()
	window.loadFile('index.html')

	window.on('resize', () => saveWindowBounds(window)).on('move', () => saveWindowBounds(window))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// console.log(app.getPath('appData'))
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

ipcMain.handle('get-index', async (evt, arg) => {
	let index = await createFilesIndex(collectionName)
	// scanFolders(collectionName,['/Volumes/Maxtor/Music'])
	return index
})

ipcMain.handle('open-config', () => {
	console.log('Open Config File')
	// shell.showItemInFolder(configFilePath)
	return
})

let saveConfigDebounce: NodeJS.Timeout

function saveWindowBounds(window: BrowserWindow) {
	if (saveConfigDebounce) clearTimeout(saveConfigDebounce)

	saveConfigDebounce = setTimeout(() => {
		saveConfig(app, {
			bounds: {
				x: window.getPosition()[0],
				y: window.getPosition()[1],
				width: window.getSize()[0],
				height: window.getSize()[1]
			}
		})
	}, 250)
}
