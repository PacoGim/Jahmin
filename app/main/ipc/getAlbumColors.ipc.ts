import { getAlbumColors } from '../functions/getAlbumColors.fn'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-album-colors', async (evt, rootDir, contrastRatio) => await getAlbumColors(rootDir, contrastRatio))
}
