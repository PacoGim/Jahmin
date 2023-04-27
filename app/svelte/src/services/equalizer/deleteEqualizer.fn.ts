import { get } from 'svelte/store'
import { confirmService } from '../../stores/service.store'
import ConfirmService from '../../svelte_services/ConfirmService.svelte'
import notifyService from '../notify.service'
import { currentEqHash, equalizerProfiles } from '../../stores/equalizer.store'

export default function (eqHash: string, eqName: string) {
	if (eqHash === '3qu') {
		return notifyService.error("Default profile can't be deleted")
	}

	let confirmState = {
		textToConfirm: `Delete equalizer "${eqName}"?`,
		title: 'Delete Equalizer',
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

					notifyService.success('Equalizer successfully deleted.')
				}
			})
		})
}
