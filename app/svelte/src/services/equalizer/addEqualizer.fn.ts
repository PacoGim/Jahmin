import { get } from 'svelte/store'
import type { PromptStateType } from '../../../../types/promptState.type'
import generateId from '../../functions/generateId.fn'
import validateFileNameFn from '../../functions/validateFileName.fn'
import { promptService } from '../../stores/service.store'
import type { EqualizerProfileType } from '../../../../types/equalizerProfile.type'
import { equalizerProfiles } from '../../stores/equalizer.store'
import notifyService from '../notify.service'

export default function addEqualizer(eqName: string = '') {
	let promptState: PromptStateType = {
		title: 'New Profile Name',
		placeholder: 'Enter new profile name',
		confirmButtonText: 'Confirm',
		cancelButtonText: 'Cancel',
		validateFn: validateFileNameFn,
		data: { inputValue: eqName }
	}

	let equalizerProfilesLocal = get(equalizerProfiles)

	get(promptService)
		.showPrompt(promptState)
		.then(promptResult => {
			get(promptService).closePrompt()

			let newEqualizerProfile: EqualizerProfileType = {
				name: promptResult.data.result,
				// Gets the equalizer values from the default profile
				values: equalizerProfilesLocal.find(x => x.hash === '3qu').values
			}

			window.ipc.addNewEqualizerProfile(newEqualizerProfile).then(result => {
				if (result.code === 'EXISTS') {
					notifyService.error(`Name ${newEqualizerProfile.name} already exists.`)
					addEqualizer(newEqualizerProfile.name)
				} else if (result.code === 'OK') {
					newEqualizerProfile.hash = result.data.hash
					equalizerProfilesLocal.unshift(newEqualizerProfile)

					equalizerProfiles.set(equalizerProfilesLocal)

					setTimeout(() => {
						let newEqElement = document.querySelector(
							`equalizer-field#eq-${result.data.hash} equalizer-name`
						) as HTMLElement

						newEqElement.click()
					}, 100)
				}
			})
		})
}
