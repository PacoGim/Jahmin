import getOsFn from "../../functions/getOs.fn"

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('get-os', getOsFn)
}
