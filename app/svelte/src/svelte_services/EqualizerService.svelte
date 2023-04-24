<script lang="ts">
	import objectToArrayFn from '../functions/objectToArray.fn'
	import notify from '../services/notify.service'

	import { equalizer, equalizerProfiles, selectedEqName, isEqualizerDirty, isEqualizerOn } from '../stores/equalizer.store'
	import type { EqualizerProfileType } from '../../../types/equalizerProfile.type'

	$: {
		// $equalizer
		// checkIfEqualizerChanged()
	}

	export function changeProfile(id: string) {
		if ($isEqualizerOn === false && $selectedEqName === id) {
			resetEqualizer()
		} else {
			$selectedEqName = id
		}
		$isEqualizerOn = true
	}

	export function updateEqualizer() {
		let equalizerFound = $equalizerProfiles.find(x => x.name === $selectedEqName)

		let newValues = {}

		objectToArrayFn($equalizer).forEach(x => (newValues[x.frequency.value] = x.gain.value))

		window.ipc.updateEqualizerValues(equalizerFound.name, newValues).then(isEqualizerUpdated => {
			if (isEqualizerUpdated) {
				equalizerFound.values = newValues
				$equalizerProfiles = $equalizerProfiles
				$isEqualizerDirty = false

				notify.success('Equalizer Updated')
			}
		})
	}

	export function gainChange(evt: Event, frequency: number) {
		const target = evt.target as HTMLInputElement
		const value = Number(target.value)

		$equalizer[frequency].gain.value = value
	}

	export function getEqualizerName(eqName: string): string {
		let equalizerProfileFound = $equalizerProfiles.find(x => x.name === eqName)
		if (equalizerProfileFound) {
			return equalizerProfileFound?.name || 'No Name'
		}
	}

	let tempEq: EqualizerProfileType = {
		name: 'Temp Equalizer',
		values: {}
	}

	export function toggleEq() {
		if ($isEqualizerOn === true) {
			// Turn off
			$isEqualizerOn = false

			for (let Hz in $equalizer) {
				tempEq.values[Hz] = $equalizer[Hz].gain.value

				$equalizer[Hz].gain.value = 0
			}
		} else {
			// Turn on
			$isEqualizerOn = true

			applyEqualizerProfile(tempEq.values)
		}
	}

	export function resetEqualizer() {
		applyEqualizerProfile($equalizerProfiles.find(x => x.name === $selectedEqName).values)
	}

	function applyEqualizerProfile(values: { [key: string]: number }) {
		for (let Hz in $equalizer) {
			$equalizer[Hz].gain.value = values[Hz]
		}
	}

	// function checkIfEqualizerChanged() {
	// 	let isChanged = false
	// 	let equalizerSelected = $equalizerProfiles.find(x => x.name === $selectedEqName)

	// 	if (equalizerSelected === undefined) return

	// 	for (let Hz in $equalizer) {
	// 		if ($equalizer[Hz].gain.value !== equalizerSelected.values[Hz]) {
	// 			isChanged = true
	// 		}
	// 	}

	// 	$isEqualizerDirty = isChanged
	// }
</script>
