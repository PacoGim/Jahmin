import { handleArtService } from '../services/handleArt.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('handle-art', (event, filePath: string, elementId: string, size: number) => {
		handleArtService(filePath, elementId, size)
	})
}
