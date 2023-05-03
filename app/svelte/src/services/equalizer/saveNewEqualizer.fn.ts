import { get } from 'svelte/store'
import type { EqualizerProfileType, EqualizerProfileValuesType } from '../../../../types/equalizerProfile.type'
import { currentEqProfile } from '../../stores/equalizer.store'
import { equalizerProfiles } from '../../stores/equalizer.store'
import notifyService from '../notify.service'

export default function (eqValues: EqualizerProfileValuesType, eqName: string, eqHash: string) {
	return new Promise((resolve, reject) => {
		let newEqualizerProfile: EqualizerProfileType = {
			name: eqName,
			hash: eqHash,
			values: eqValues
		}

		window.ipc.addNewEqualizerProfile(newEqualizerProfile).then(result => {
			if (result.code === 'EXISTS') {
				notifyService.error(`Name ${newEqualizerProfile.name} already exists.`)
				reject('Bad')
			} else if (result.code === 'OK') {
				let equalizerProfilesLocal = get(equalizerProfiles)

				newEqualizerProfile.type = 'Local'

				equalizerProfilesLocal.unshift(newEqualizerProfile)

				equalizerProfiles.set(equalizerProfilesLocal)

				if (get(currentEqProfile).hash === newEqualizerProfile.hash) {
					currentEqProfile.set(newEqualizerProfile)
				}

				resolve('Good')
			}
		})
	})
}
