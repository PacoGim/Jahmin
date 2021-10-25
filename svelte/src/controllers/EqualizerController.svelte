<script lang="ts">
	import { getEqualizersIPC, saveConfig } from '../service/ipc.service'
	import { equalizerIdConfig } from '../store/config.store'
	import { context, equalizerProfiles, selectedEqId, source, equalizer } from '../store/equalizer.store'
	import type { EqualizerType } from '../types/equalizer.type'

	let equalizerGainValues = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384]
	let isFirstSelectedEqIdChange = true

	$: {
		if ($context !== undefined) {
			getAudioFilters().then(() => {
				loadEqualizer().then(() => changeEqualizer())
			})
		}
	}

	$: {
		if ($selectedEqId !== undefined) {
			if (isFirstSelectedEqIdChange === false) {
				changeEqualizer()
			} else {
				isFirstSelectedEqIdChange = false
			}
		}
	}

	async function loadEqualizer(): Promise<void> {
		return new Promise((resolve, reject) => {
			let audioNode = undefined

			for (const [index, equalizerGainValue] of equalizerGainValues.entries()) {
				const biquadFilter = $context.createBiquadFilter()
				biquadFilter.type = 'peaking'
				biquadFilter.frequency.value = equalizerGainValue
				biquadFilter.gain.value = 0

				$equalizer[equalizerGainValue] = biquadFilter

				if (index === 0) {
					audioNode = $source.connect(biquadFilter)
				} else if (index === equalizerGainValues.length - 1) {
					audioNode = audioNode.connect(biquadFilter)
					audioNode = audioNode.connect($context.destination)
				} else {
					audioNode = audioNode.connect(biquadFilter)
				}
			}

			resolve()
		})
	}

	function changeEqualizer() {
		let foundEqualizerProfile = $equalizerProfiles.find(x => x.id === $selectedEqId)

		if (foundEqualizerProfile) {
			for (const value of foundEqualizerProfile.values) {
				$equalizer[value.frequency].gain.value = value.gain
			}

			$equalizer = $equalizer

			// Save ID to config file
			saveConfig({
				userOptions: {
					equalizerId: foundEqualizerProfile.id
				}
			})
		}
	}

	function getAudioFilters(): Promise<void> {
		return new Promise((resolve, reject) => {
			getEqualizersIPC().then(result => {

				$equalizerProfiles = result

				let equalizerFound = result.find(x => x.id === $equalizerIdConfig)

				if (equalizerFound) {
					$equalizerProfiles = $equalizerProfiles.sort((a, b) => a.name.localeCompare(b.name))

					// Moves the previously used equalizer to the top of the list.
					let index = $equalizerProfiles.findIndex(x => x.id === equalizerFound.id)
					$equalizerProfiles.unshift($equalizerProfiles.splice(index, 1)[0])

					$selectedEqId = equalizerFound.id
				} else {
					let defaultEqualizerFound = result.find(x => x.id === 'Default')
					if (defaultEqualizerFound) {
						$selectedEqId = defaultEqualizerFound.id
					}
				}

				resolve()
			})
		})
	}
</script>
