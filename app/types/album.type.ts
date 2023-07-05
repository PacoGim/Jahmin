import type { SongType } from './song.type'

export type AlbumType = {
	Album: string
	AlbumArtist: string
	ID: string
	Directory: string
	Songs: SongType[]
}
