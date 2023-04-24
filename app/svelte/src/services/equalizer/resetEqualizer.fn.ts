import { get } from 'svelte/store'
import { currentEqProfile } from '../../stores/equalizer.store'
import loadEqualizerValuesFn from './loadEqualizerValues.fn'

export default function () {
	loadEqualizerValuesFn(get(currentEqProfile).values)
}
