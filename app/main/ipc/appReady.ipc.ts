import appReadyService from '../services/appReady.service'

export default function (ipcMain: Electron.IpcMain) {
  ipcMain.on('app-ready', appReadyService)
}