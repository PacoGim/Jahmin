<script lang="ts">
	import { onMount } from 'svelte'
	import { getEqualizersIPC } from '../service/ipc.service'
	import { equalizerIdConfig } from '../store/config.store'
	import { audioFilters, context, source } from '../store/equalizer.store'
	import type { AudioFilterType } from '../types/audioFilter.type'

	async function loadEqualizer() {
		let audioNode = undefined
		$audioFilters = await getAudioFilters()

		$audioFilters.forEach((audioFilter, index) => {
			const biquadFilter = $context.createBiquadFilter()
			biquadFilter.type = 'peaking'
			biquadFilter.frequency.value = audioFilter.frequency
			biquadFilter.gain.value = audioFilter.gain

			audioFilter.biquadFilter = biquadFilter

			if (index === 0) {
				audioNode = $source.connect(biquadFilter)
			} else if (index === $audioFilters.length - 1) {
				audioNode = audioNode.connect(biquadFilter)
				audioNode = audioNode.connect($context.destination)
			} else {
				audioNode = audioNode.connect(biquadFilter)
			}
		})
	}

	function getAudioFilters(): Promise<AudioFilterType[]> {
		return new Promise((resolve, reject) => {
			getEqualizersIPC().then(result => {
				let equalizerFound = result.find(x => x.id === $equalizerIdConfig)

				if (equalizerFound) {
					resolve(equalizerFound.values)
				}
			})
		})
	}

	onMount(() => {
		loadEqualizer()
	})
</script>
