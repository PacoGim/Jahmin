import { get } from 'svelte/store'
import type { PromptStateType } from '../../../../types/promptState.type'
import validateFileNameFn from '../../functions/validateFileName.fn'
import { promptService } from '../../stores/service.store'
import notifyService from '../notify.service'
import { equalizerProfiles } from '../../stores/equalizer.store'
import traduceFn from '../../functions/traduce.fn'

export default function renameEq(eqHash: string, eqName: string) {
	if (eqHash === '3qu') {
		return notifyService.error(traduceFn("The Default profile can't be renamed"))
	}

	let promptState: PromptStateType = {
		title: traduceFn('Rename Equalizer Preset'),
		placeholder: traduceFn('Equalizer new name'),
		confirmButtonText: traduceFn('Rename'),
		cancelButtonText: traduceFn('Cancel'),
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
					let newHash = result.data.hash

					let equalizerProfilesLocal = get(equalizerProfiles)
					let equalizerFound = equalizerProfilesLocal.find(x => x.hash === eqHash)

					if (equalizerFound) {
						equalizerFound.name = newName
						equalizerFound.hash = newHash
						equalizerProfiles.set(equalizerProfilesLocal)
					}

					notifyService.success(traduceFn('Equalizer renamed to "${newName}"', { newName }))
				} else if (result.code === 'EXISTS') {
					notifyService.error(traduceFn('Name ${newName} already exists', { newName }))

					return renameEq(eqHash, eqName)
				} else if (result.code === 'NOT_FOUND') {
					notifyService.error(
						traduceFn('Equalizer ${newName} not found. We suggest you delete the profile manually and restart the app.', {
							newName
						})
					)
				}
			})
		})
}
