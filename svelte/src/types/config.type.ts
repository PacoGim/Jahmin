export type ConfigType = {
	bounds?: BoundsType
	rootDirectories?: string[]
	order: OrderType
	art: ArtType
	groupOnlyByFolder: boolean
	songListTags?: any[]
	equalizerId?: string
	theme: ThemeOptions
}

export enum ThemeOptions {
	Auto = 'Auto',
	Dark = 'Dark',
	Light = 'Light'
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
