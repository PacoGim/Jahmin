<script lang="ts">
	const context = new window.AudioContext()
	const mediaElement = document.querySelector('audio')
	const source = context.createMediaElementSource(mediaElement)

	let audioFilters: { frequency: number; biquadFilter?: BiquadFilterNode; gain: number }[] = [
		{ frequency: 32, gain: 0 },
		{ frequency: 64, gain: 2 },
		{ frequency: 128, gain: 0 },
		{ frequency: 256, gain: -2 },
		{ frequency: 512, gain: 0 },
		{ frequency: 1024, gain: 0 },
		{ frequency: 2048, gain: 0 },
		{ frequency: 4096, gain: 2 },
		{ frequency: 8192, gain: 2 },
		{ frequency: 16384, gain: 1 }
	]

	let audioFiltersCopy: { frequency: number; biquadFilter?: BiquadFilterNode; gain: number }[] = audioFilters

	let audioNode = undefined

	let isEqualizerEnabled = true

	audioFilters.forEach((audioFilter, index) => {
		const biquadFilter = context.createBiquadFilter()
		biquadFilter.type = 'peaking'
		biquadFilter.frequency.value = audioFilter.frequency
		biquadFilter.gain.value = audioFilter.gain

		audioFilter.biquadFilter = biquadFilter

		if (index === 0) {
			audioNode = source.connect(biquadFilter)
		} else if (index === audioFilters.length - 1) {
			audioNode = audioNode.connect(biquadFilter)
			audioNode = audioNode.connect(context.destination)
		} else {
			audioNode = audioNode.connect(biquadFilter)
		}
	})

	function gainChange(evt: Event, frequency: number) {
		const target = evt.target as HTMLInputElement
		const value = Number(target.value)

		let audioFilter = audioFilters.find(x => x.frequency === frequency)

		audioFilter.biquadFilter.gain.value = value

		audioFilters = audioFilters
	}

	function toggleEq() {
		if (isEqualizerEnabled === true) {
			audioFilters.forEach(audioFilter => (audioFilter.biquadFilter.gain.value = 0))
		} else {
			audioFiltersCopy.forEach(audioFilter => {
				audioFilters.find(x => x.frequency === audioFilter.frequency).biquadFilter.gain.value = audioFilter.gain
			})
		}
		isEqualizerEnabled = !isEqualizerEnabled
		audioFilters = audioFilters
	}
</script>

<audio-filters>
	{#each audioFilters as audioFilter, index (index)}
		<audio-filter-range>
			<filter-frequency>{audioFilter.frequency} Hz</filter-frequency>
			<input
				type="range"
				min="-10"
				max="10"
				value="0"
				on:input={evt => {
					gainChange(evt, audioFilter.frequency)
				}}
			/>
			<filter-gain>{audioFilter.biquadFilter.gain.value} dB</filter-gain>
		</audio-filter-range>
	{/each}
</audio-filters>
<button class={isEqualizerEnabled ? 'active' : 'not-active'} on:click={() => toggleEq()}>Toggle EQ</button>

<style>
	button {
		color: #fff;
	}
	button.not-active {
		background-color: crimson;
	}
	button.active {
		background-color: cornflowerblue;
	}
	audio-filters {
		display: flex;
		flex-direction: row;
	}
	audio-filter-range {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	input {
		-webkit-appearance: slider-vertical; /* WebKit */
		/* width: 8px; */
		/* height: 175px; */
		/* padding: 0 5px; */
		/* display: block; */
		/* width: 100%; */
	}
</style>
