<script lang="ts">
	import { getEqualizersIPC, saveConfig } from '../services/ipc.service'
	import { equalizerIdConfig } from '../store/config.store'
	import {
		context,
		equalizerProfiles,
		selectedEqId,
		sourceMainAudio,
		sourceAltAudio,
		equalizer
	} from '../store/equalizer.store'

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

	// Loads the equalizer for both the main and alt audio player.
	async function loadEqualizer(): Promise<void> {
		return new Promise((resolve, reject) => {
			let audioNodeMainAudio = undefined
			let audioNodeAltAudio = undefined

			for (const [index, equalizerGainValue] of equalizerGainValues.entries()) {
				const biquadFilter = $context.createBiquadFilter()
				biquadFilter.type = 'peaking'
				biquadFilter.frequency.value = equalizerGainValue
				biquadFilter.gain.value = 0

				$equalizer[equalizerGainValue] = biquadFilter

				// Connects the equalizer filters to the audio node.
				if (index === 0) {
					// If the index is 0, then the audio node is opened and ready from source.
					audioNodeMainAudio = $sourceMainAudio.connect(biquadFilter)
					audioNodeAltAudio = $sourceAltAudio.connect(biquadFilter)
				} else if (index === equalizerGainValues.length - 1) {
					// If the index is the last, then the audio node is closed and ready to be connected to the destination.
					audioNodeMainAudio = audioNodeMainAudio.connect(biquadFilter)
					audioNodeMainAudio = audioNodeMainAudio.connect($context.destination)

					audioNodeAltAudio = audioNodeAltAudio.connect(biquadFilter)
					audioNodeAltAudio = audioNodeAltAudio.connect($context.destination)
				} else {
					// If the index is not 0 or the last, then the audio node is connected to the next filter.
					audioNodeMainAudio = audioNodeMainAudio.connect(biquadFilter)
					audioNodeAltAudio = audioNodeAltAudio.connect(biquadFilter)
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
