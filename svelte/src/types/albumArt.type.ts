export type AlbumArtType = {
	version?: number
	artSize?: number
	data?: AlbumArtDataType
}

type AlbumArtDataType = { filePath: string; fileType: string; isNew?: boolean }
