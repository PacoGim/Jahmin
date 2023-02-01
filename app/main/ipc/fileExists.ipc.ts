import fileExistsFn from '../functions/fileExists.fn'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('file-exists', async (evt, filePath: string) => {
		return fileExistsFn(filePath)
	})
}