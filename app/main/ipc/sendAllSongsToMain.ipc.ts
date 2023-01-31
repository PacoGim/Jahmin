import { SongType } from '../../types/song.type'
import { fetchSongsTag } from '../services/librarySongs.service'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('send-all-songs-to-main', (evt, songsDb: SongType[]) => fetchSongsTag(songsDb))
}
