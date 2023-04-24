import { get } from 'svelte/store'
import { currentEqHash, currentEqProfile, equalizerProfiles, isEqualizerDirty } from '../../stores/equalizer.store'
import getEqualizerValuesFn from './getEqualizerValues.fn'
import type { EqualizerProfileType } from '../../../../types/equalizerProfile.type'
import notifyService from '../notify.service'
import saveEqHashConfigFn from './saveEqHashConfig.fn'

export default function () {
	let currentEqProfileLocal = get(currentEqProfile)

	if (!currentEqProfileLocal) return

	let currentEqValues = getEqualizerValuesFn()

	for (const frequency in currentEqValues) {
		currentEqProfileLocal.values[frequency] = currentEqValues[frequency]
	}

	window.ipc
		.updateEqualizerValues(currentEqProfileLocal.hash, currentEqProfileLocal.values)
		.then((savedEq: EqualizerProfileType) => {
			let equalizerProfilesLocal = get(equalizerProfiles)

			let equalizerProfileIndex = equalizerProfilesLocal.findIndex(x => x.hash === currentEqProfileLocal.hash)

			equalizerProfilesLocal[equalizerProfileIndex] = savedEq

			equalizerProfiles.set(equalizerProfilesLocal)

			currentEqProfile.set(savedEq)
			currentEqHash.set(savedEq.hash)
			isEqualizerDirty.set(false)

			notifyService.success('Equalizer Updated')

			saveEqHashConfigFn(savedEq.hash)
		})
}
