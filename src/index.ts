import { app, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import { scanFolders } from './js/indexer'
import { createFilesIndex, index } from './js/knotdb'

const collectionName = 'music'

function createWindow() {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 1920,
		height: 1080,
		webPreferences: {
			nodeIntegration: true,
			worldSafeExecuteJavaScript: true
		}
	})

	win.webContents.openDevTools()
	win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

ipcMain.handle('get-index', async (evt, arg) => {
	let index = await createFilesIndex(collectionName)
	return index
})
