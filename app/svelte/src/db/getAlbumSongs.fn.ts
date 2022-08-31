import getDirectoryFn from '../functions/getDirectory.fn'
import type { SongType } from '../../../types/song.type'
import getAllSongsFn from './getAllSongs.fn'

export default function (rootDir: string): Promise<SongType[]> {
	return new Promise((resolve, reject) => {
		getAllSongsFn().then(songs => {
			resolve(songs.filter(song => getDirectoryFn(song.SourceFile) === rootDir))
		})
	})
}
