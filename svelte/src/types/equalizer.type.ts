import type { AudioFilterType } from './audioFilter.type'

export type EqualizerType = {
	id: string
	name: string
	values: AudioFilterType[]
}
