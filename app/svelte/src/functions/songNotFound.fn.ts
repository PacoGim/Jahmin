import type { SongType } from '../../../types/song.type'
import notifyService from '../services/notify.service'
import nextSongFn from './nextSong.fn'

export default function (song: SongType) {
	window.ipc.fileExists(song.SourceFile).then(result => {
		if (result === false) {
			notifyService.error(`File "${song.SourceFile}" not found!`, {
				timeout: 10000,
				closeOnClick: true,
				buttons: [
					[
						'<button style="color:#fff;border:solid 2px #fff;">Delete from library</button>',
						function () {
							// TODO Add this to the new db
							// addTaskToQueue(song.ID, 'delete')

							nextSongFn()
						},
						false
					]
				]
			})
		}
	})
}
