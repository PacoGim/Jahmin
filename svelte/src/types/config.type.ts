export type ConfigType = {
	bounds?: BoundsType
	rootDirectories?: string[]
	order: OrderType
	art: ArtType
	groupOnlyByFolder: boolean
	songListTags: any[]
	userOptions: UserOptionsType
}

type UserOptionsType = {
	equalizerId: string
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
