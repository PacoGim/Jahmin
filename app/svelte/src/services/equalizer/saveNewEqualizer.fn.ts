import { get } from 'svelte/store'
import type { EqualizerProfileType, EqualizerProfileValuesType } from '../../../../types/equalizerProfile.type'
import { currentEqHash } from '../../stores/equalizer.store'
import { equalizerProfiles } from '../../stores/equalizer.store'
import notifyService from '../notify.service'

export default function (eqValues: EqualizerProfileValuesType, eqName: string, eqHash: string) {
	let newEqualizerProfile: EqualizerProfileType = {
		name: eqName,
		hash: eqHash,
		values: eqValues
	}

	window.ipc.addNewEqualizerProfile(newEqualizerProfile).then(result => {
		if (result.code === 'EXISTS') {
			notifyService.error(`Name ${newEqualizerProfile.name} already exists.`)
		} else if (result.code === 'OK') {
			let equalizerProfilesLocal = get(equalizerProfiles)

			equalizerProfilesLocal.unshift(newEqualizerProfile)

			equalizerProfiles.set(equalizerProfilesLocal)

			// $equalizerProfiles = $equalizerProfiles
			// $selectedEqName = newEqualizerProfile.name
			currentEqHash.set(newEqualizerProfile.hash)
		}
	})
}
