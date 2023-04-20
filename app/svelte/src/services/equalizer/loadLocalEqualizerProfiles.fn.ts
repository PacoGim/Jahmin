import { get } from 'svelte/store'
import { config } from '../../stores/config.store'
import { currentEqHash, equalizerProfiles, selectedEqName } from '../../stores/equalizer.store'
import type { EqualizerProfileType } from '../../../../types/equalizerProfile.type'

export default function (): Promise<EqualizerProfileType> {
	return new Promise((resolve, reject) => {
		window.ipc.getEqualizers().then(equalizers => {
			let localConfig = get(config)

			let equalizerFound = equalizers.find(x => x.hash === localConfig.userOptions.equalizerHash)

			if (equalizerFound) {
				equalizers = equalizers.sort((a, b) => a.name.localeCompare(b.name))
				// Moves the previously used equalizer to the top of the list.
				let index = equalizers.findIndex(x => x.hash === equalizerFound.hash)
				equalizers.unshift(equalizers.splice(index, 1)[0])

				selectedEqName.set(equalizerFound.name)
				currentEqHash.set(equalizerFound.hash)

				resolve(equalizerFound)
			} else {
				let defaultEqualizer = equalizers.find(x => x.hash === '3qu')

				selectedEqName.set(defaultEqualizer.name)
				currentEqHash.set(defaultEqualizer.hash)
				resolve(defaultEqualizer)
			}
			equalizerProfiles.set(equalizers)
		})
	})
}
