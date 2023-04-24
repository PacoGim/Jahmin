import { get } from 'svelte/store'
import { equalizer } from '../../stores/equalizer.store'
import checkIfEqualizerDirtyFn from './checkIfEqualizerDirty.fn'

export default function (evt: HTMLInputElement, frequency: number) {
	let value = Number(evt.value)

	let equalizerLocal = get(equalizer)

	equalizerLocal[frequency].gain.value = value

	equalizer.set(equalizerLocal)

	checkIfEqualizerDirtyFn()
}
