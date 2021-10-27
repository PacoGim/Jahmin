export type EqualizerProfileType = {
	id: string
	name: string
	values: EqualizerProfileValuesType[]
}

export type EqualizerProfileValuesType = {
	frequency: number
	gain: number
}
