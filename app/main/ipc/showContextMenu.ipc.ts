import { loadContextMenu } from "../context_menu/contextMenu";

export default function (ipcMain: Electron.IpcMain) {
  ipcMain.on('show-context-menu', (evt, menuToOpen: string, parameters: any) => loadContextMenu(evt, menuToOpen, parameters))
}