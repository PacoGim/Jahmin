import { get } from 'svelte/store'
import type { PromptStateType } from '../../../../types/promptState.type'
import validateFileNameFn from '../../functions/validateFileName.fn'
import { promptService } from '../../stores/service.store'
import notifyService from '../notify.service'
import { equalizerProfiles } from '../../stores/equalizer.store'

export default function renameEq(eqHash: string, eqName: string) {
	if (eqHash === '3qu') {
		return notifyService.error("Default profile can't be deleted")
	}

	let promptState: PromptStateType = {
		title: 'Rename Equalizer Preset',
		placeholder: 'Equalizer new name',
		confirmButtonText: 'Rename',
		cancelButtonText: 'Cancel',
		validateFn: validateFileNameFn,
		data: { eqName, inputValue: eqName }
	}

	get(promptService)
		.showPrompt(promptState)
		.then(promptResult => {
			let newName = promptResult.data.result

			window.ipc.renameEqualizer(eqHash, newName).then(result => {
				get(promptService).closePrompt()

				if (result.code === 'OK') {
					let equalizerProfilesLocal = get(equalizerProfiles)
					let equalizerFound = equalizerProfilesLocal.find(x => x.name === eqName)

					if (equalizerFound) {
						equalizerFound.name = newName
						equalizerProfiles.set(equalizerProfilesLocal)
					}

					notifyService.success(`Equalizer renamed to "${newName}"`)
				} else if (result.code === 'EXISTS') {
					notifyService.error(`Name ${newName} already exists.`)

					return renameEq(eqHash, eqName)
				} else if (result.code === 'NOT_FOUND') {
					notifyService.error(`Equalizer ${newName} not found. We suggest you delete the profile manually and restart the app.`)
				}
			})
		})
}
