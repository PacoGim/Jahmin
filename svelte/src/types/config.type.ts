export type ConfigType = {
	bounds?: BoundsType
	rootDirectories?: string[]
	order: OrderType
	art: ArtType
	userOptions: UserOptions
}

type UserOptions = {
	groupOnlyByFolder: boolean
}

type ArtType = {
	dimension: number
}

type OrderType = {
	grouping: string[]
	filtering: string[]
}

type BoundsType = {
	x: number
	y: number
	height: number
	width: number
}
