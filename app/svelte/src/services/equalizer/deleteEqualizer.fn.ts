import { get } from 'svelte/store'
import { confirmService } from '../../stores/service.store'
import notifyService from '../notify.service'
import { currentEqHash, equalizerProfiles } from '../../stores/equalizer.store'
import traduceFn from '../../functions/traduce.fn'

export default function (eqHash: string, eqName: string) {
	if (eqHash === '3qu') {
		return notifyService.error(traduceFn("The Default profile can't be deleted"))
	}

	let confirmState = {
		textToConfirm: traduceFn('Delete equalizer "${eqName}"?', { eqName: traduceFn(eqName) }),
		title: traduceFn('Delete Equalizer'),
		data: {
			name: eqName
		}
	}

	get(confirmService)
		.showConfirm(confirmState)
		.then(() => {
			get(confirmService).closeConfirm()

			window.ipc.deleteEqualizer(eqHash).then(result => {
				if (result.code === 'OK') {
					let equalizerProfilesLocal = get(equalizerProfiles)

					let indexToDelete = equalizerProfilesLocal.findIndex(x => x.hash === eqHash)

					equalizerProfilesLocal.splice(indexToDelete, 1)

					equalizerProfiles.set(equalizerProfilesLocal)

					if (get(currentEqHash) === eqHash) {
						let defaultEqElement = document.querySelector('equalizer-field#eq-3qu equalizer-name') as HTMLElement

						defaultEqElement.click()
					}

					notifyService.success(traduceFn('Equalizer successfully deleted'))
				}
			})
		})
}
