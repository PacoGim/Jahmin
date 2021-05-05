import { app, BrowserWindow, ipcMain, Menu, protocol, screen, shell } from 'electron'
import path from 'path'

export const appDataPath = () => path.join(app.getPath('appData'), 'Jahmin')

import { getConfig, saveConfig } from './services/config.service'

import { initWorkers, killAllWorkers } from './services/worker.service'
initWorkers()

import { loadIPC } from './services/ipc.service'
loadIPC()

import { getCollectionMap, loadDb } from './services/loki.service'
import { getRootDirFolderWatcher, watchFolders } from './services/folderWatcher.service'
import { ConfigType } from './types/config.type'

async function createMainWindow() {
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
			worldSafeExecuteJavaScript: true,
			contextIsolation: false,
			enableRemoteModule: true
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

ipcMain.on('show-context-menu', (event, menuToOpen, parameters = {}) => {
	let template: any = []

	parameters = JSON.parse(parameters)

	if (menuToOpen === 'AlbumContextMenu') {
		let album = getCollectionMap().get(parameters.albumID)

		template = [
			{
				label: `Open ${album?.Name || ''} Folder`,
				click: () => {
					shell.showItemInFolder(album?.RootDir || '')
				}
			}
		]
	}

	const menu = Menu.buildFromTemplate(template)
	//@ts-expect-error
	menu.popup(BrowserWindow.fromWebContents(event.sender))
})

app.whenReady().then(createMainWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('before-quit', () => {
	killAllWorkers()
	getRootDirFolderWatcher()?.close()
})

// process.on('exit',()=>{

// })

app.on('activate', () => {
	// console.log(app.getPath('appData'))
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
