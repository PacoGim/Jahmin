<script lang="ts">
	import { objectToArray } from '../service/index.service'
	import { updateEqualizerValuesIPC } from '../service/ipc.service'
	import notify from '../service/notify.service'

	import { equalizer, equalizerProfiles, selectedEqId, isEqualizerDirty, isEqualizerOn } from '../store/equalizer.store'

	$: {
		$equalizer
		checkIfEqualizerChanged()
	}

	export function changeProfile(id: string) {
		if ($isEqualizerOn === false && $selectedEqId === id) {
			resetEqualizer()
		} else {
			$selectedEqId = id
		}
		$isEqualizerOn = true
	}

	export function updateEqualizer() {
		let equalizerFound = $equalizerProfiles.find(x => x.id === $selectedEqId)

		let newValues = objectToArray($equalizer).map(x => {
			return {
				frequency: x.frequency.value,
				gain: x.gain.value
			}
		})

		updateEqualizerValuesIPC(equalizerFound.id, newValues).then(isEqualizerUpdated => {
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

	export function getEqualizerName(eqId: string): string {
		let equalizerProfileFound = $equalizerProfiles.find(x => x.id === eqId)
		if (equalizerProfileFound) {
			return equalizerProfileFound?.name || 'No Name'
		}
	}

	export function toggleEq() {
		if ($isEqualizerOn === true) {
			// Turn off
			$isEqualizerOn = false

			for (let i in $equalizer) {
				$equalizer[i].gain.value = 0
			}
		} else {
			// Turn on
			$isEqualizerOn = true

			applyEqualizerProfile($selectedEqId)
		}
	}

	export function resetEqualizer() {
		applyEqualizerProfile($selectedEqId)
	}

	function applyEqualizerProfile(id: string) {
		let equalizerSelected = $equalizerProfiles.find(x => x.id === id)

		for (let i in $equalizer) {
			$equalizer[i].gain.value = equalizerSelected.values.find(x => x.frequency === Number(i)).gain
		}
	}

	function checkIfEqualizerChanged() {
		let isChanged = false
		let equalizerSelected = $equalizerProfiles.find(x => x.id === $selectedEqId)

		if (equalizerSelected === undefined) return

		for (let i in $equalizer) {
			if ($equalizer[i].gain.value !== equalizerSelected.values.find(x => x.frequency === Number(i)).gain) {
				isChanged = true
			}
		}

		$isEqualizerDirty = isChanged
	}
</script>
