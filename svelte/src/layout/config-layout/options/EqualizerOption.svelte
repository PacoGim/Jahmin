<script lang="ts">
	import { onMount } from 'svelte'

	import OptionSection from '../../../components/OptionSection.svelte'
	import { audioFilters } from '../../../store/equalizer.store'
	import type { AudioFilterType } from '../../../types/audioFilter.type'

	let isEqualizerEnabled = true

	let audioFiltersCopy: AudioFilterType[] = $audioFilters

	function gainChange(evt: Event, frequency: number) {
		const target = evt.target as HTMLInputElement
		const value = Number(target.value)

		let audioFilter = $audioFilters.find(x => x.frequency === frequency)

		audioFilter.biquadFilter.gain.value = value

		$audioFilters = $audioFilters
	}

	function toggleEq() {
		if (isEqualizerEnabled === true) {
			$audioFilters.forEach(audioFilter => (audioFilter.biquadFilter.gain.value = 0))
		} else {
			audioFiltersCopy.forEach(audioFilter => {
				$audioFilters.find(x => x.frequency === audioFilter.frequency).biquadFilter.gain.value = audioFilter.gain
			})
		}
		isEqualizerEnabled = !isEqualizerEnabled
		$audioFilters = $audioFilters
	}

	onMount(() => {})
</script>

<OptionSection title="Equalizer">
	<equalizer-section slot="body">
		<audio-filters>
			{#each $audioFilters as audioFilter, index (index)}
				<audio-filter-range>
					<filter-frequency>{audioFilter.frequency} Hz</filter-frequency>
					<eq-input-container>
						<input
							type="range"
							min="-10"
							max="10"
							value={audioFilter.gain}
							on:input={evt => {
								gainChange(evt, audioFilter.frequency)
							}}
						/>
					</eq-input-container>
					<filter-gain>{audioFilter.biquadFilter.gain.value} dB</filter-gain>
				</audio-filter-range>
			{/each}
		</audio-filters>
		<button class={isEqualizerEnabled ? 'active' : 'not-active'} on:click={() => toggleEq()}>Toggle EQ</button>
	</equalizer-section>
</OptionSection>

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
		justify-content: space-evenly;
		margin: 0 auto;
		width: max-content;
	}
	audio-filter-range {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 1rem;
	}

	eq-input-container {
		--bar-width: 20px;
		width: var(--bar-width);
		height: 150px;
	}

	input {
		width: 150px;
		height: var(--bar-width);
		transform-origin: 75px 75px;
		transform: rotate(-90deg);

		-webkit-appearance: none;

		background: #000;
		outline: none;
		border: 1px solid lawngreen;
	}

	input::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		background: #000;
		outline: none;
		border: 1px solid lawngreen;
	}
</style>
