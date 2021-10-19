export type EqualizerProfileType = {
	id: string
	name: string
	values: {
		frequency: number
		gain: number
	}[]
}
