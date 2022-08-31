import type { SongType } from './song.type'

export type AlbumType = {
	Album: string
	AlbumArtist: string
	DynamicAlbumArtist: string
	ID: string
	RootDir: string
	Songs: SongType[]
}
