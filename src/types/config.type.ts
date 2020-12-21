export type ConfigType = {
	bounds?: BoundsType
	order: OrderType
	art: ArtType
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
