import { join as pathJoin } from 'path'
import getAppDataPathFn from '../functions/getAppDataPath.fn'
import { existsSync as fsExistsSync, mkdirSync as fsMkdirSync, writeFile as fsWriteFile } from 'fs'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('create-new-playlist', async (evt, newPlaylistName: string) => {
		return new Promise((resolve, reject) => {
			let playlistFolderPath = pathJoin(getAppDataPathFn(), '/playlists')

			if (!fsExistsSync(playlistFolderPath)) {
				fsMkdirSync(playlistFolderPath)
			}

			let newPlaylistFileName = pathJoin(playlistFolderPath, `${newPlaylistName}.json`)

			if (fsExistsSync(newPlaylistFileName)) {
				/********************** RETURN **********************/
				return resolve({
					code: -1,
					message: `Playlist name "${newPlaylistName}" already used`,
					data: {
						fileName: newPlaylistName,
						filePath: newPlaylistFileName
					}
				})
			}

			fsWriteFile(newPlaylistFileName, JSON.stringify([]), err => {
				if (err) {
					/********************** RETURN **********************/
					return resolve({
						code: -1,
						message: err.message,
						data: {
							fileName: newPlaylistName,
							filePath: newPlaylistFileName
						}
					})
				} else {
					/********************** RETURN **********************/
					return resolve({
						code: 0,
						message: `Playlist "${newPlaylistName}" created!`,
						data: {
							fileName: newPlaylistName,
							filePath: newPlaylistFileName
						}
					})
				}
			})
		})
	})
}
