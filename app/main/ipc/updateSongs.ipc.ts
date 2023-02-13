import { SongType } from '../../types/song.type'
import { unwatchPaths } from '../services/chokidar.service'
import { addToTaskQueue } from '../services/librarySongs.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('update-songs', (evt, songs: SongType[], newTags) => {
		songs.forEach(song => {
			unwatchPaths([song.SourceFile])

			addToTaskQueue(song.SourceFile, 'update', newTags)
		})
	})
}
