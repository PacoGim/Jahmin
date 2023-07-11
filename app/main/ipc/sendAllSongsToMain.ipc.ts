import { SongType } from '../../types/song.type'

export default function (ipcMain: Electron.IpcMain) {
	ipcMain.on('send-all-songs-to-main', (evt, songsDb: SongType[]) => {})
}
