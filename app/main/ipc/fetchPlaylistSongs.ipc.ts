import { join as pathJoin } from 'path'
import getAppDataPathFn from '../functions/getAppDataPath.fn'
import { existsSync as fsExistsSync, readFileSync as fsReadFileSync } from 'fs'
import parseJSONFn from '../functions/parseJSON.fn'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('fetch-playlist-songs', async (evt, playListName: string) => {
		return new Promise((resolve, reject) => {
			let playlistFilePath = pathJoin(getAppDataPathFn(), '/playlists', playListName + '.json')

			if (!fsExistsSync(playlistFilePath)) {
				/********************** RETURN **********************/
				return resolve({
					code: -1,
					message: `Playlist ${playListName} not found`
				})
			}

			let fileSongs = parseJSONFn(fsReadFileSync(playlistFilePath, 'utf-8'))

			/********************** RETURN **********************/
			return resolve({
				code: 0,
				data: fileSongs
			})
		})
	})
}
