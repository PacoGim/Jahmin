import { savePeaks } from "../services/peaks.service";

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('save-peaks', (evt, sourceFile: string, peaks: number[]) => savePeaks(sourceFile, peaks))
}
