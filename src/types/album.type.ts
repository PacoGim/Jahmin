import { SongType } from './song.type'

export type AlbumType = {
	[index: string]: string | number | SongType[] | undefined
	ID: string
	RootDir: string
	Name: string
	Songs: [SongType]
}
