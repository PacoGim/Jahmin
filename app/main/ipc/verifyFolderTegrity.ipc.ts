import verifyFolderTegrityFn from '../functions/verifyFolderTegrity.fn'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('verify-folder-tegrity', (evt, folderRoot: string) => {
		verifyFolderTegrityFn(folderRoot)
	})
}
