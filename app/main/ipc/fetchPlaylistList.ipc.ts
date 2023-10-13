import { join as pathJoin } from 'path'
import getAppDataPathFn from '../functions/getAppDataPath.fn'
import {
	existsSync as fsExistsSync,
	mkdirSync as fsMkdirSync,
	writeFile as fsWriteFile,
	readdirSync as fsReadDirSync,
	readFileSync
} from 'fs'
import parseJSONFn from '../functions/parseJSON.fn'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.handle('fetch-playlist-list', async evt => {
		return new Promise((resolve, reject) => {
			let playlistFolderPath = pathJoin(getAppDataPathFn(), '/playlists')

			if (!fsExistsSync(playlistFolderPath)) {
				/********************** RETURN **********************/
				return resolve({
					code: -1,
					message: `No playlist directory found`
				})
			}

			let files = fsReadDirSync(playlistFolderPath)
				.filter(file => file.endsWith('.json'))
				.map(file => file.replace('.json', ''))

			/********************** RETURN **********************/
			return resolve({
				code: 0,
				data: files
			})
		})
	})
}

// let filePath = pathJoin(playlistFolderPath, file)

// if (fsExistsSync(filePath)) {
// return {
// name: file.replace('.json', ''),
// songs: parseJSONFn(readFileSync(filePath, { encoding: 'utf-8' }))
// }
// }
