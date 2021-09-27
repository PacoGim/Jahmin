<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import generateId from '../../../functions/generateId.fn'
	import EditIcon from '../../../icons/EditIcon.svelte'
	import { selectedEq, equalizers } from '../../../store/equalizer.store'
	import type { AudioFilterType } from '../../../types/audioFilter.type'

	let isEqualizerEnabled = true

	let audioFiltersCopy: AudioFilterType[] = $selectedEq

	function gainChange(evt: Event, frequency: number) {
		const target = evt.target as HTMLInputElement
		const value = Number(target.value)

		let audioFilter = $selectedEq.find(x => x.frequency === frequency)

		audioFilter.biquadFilter.gain.value = value

		$selectedEq = $selectedEq
	}

	function toggleEq() {
		if (isEqualizerEnabled === true) {
			$selectedEq.forEach(audioFilter => (audioFilter.biquadFilter.gain.value = 0))
		} else {
			audioFiltersCopy.forEach(audioFilter => {
				$selectedEq.find(x => x.frequency === audioFilter.frequency).biquadFilter.gain.value = audioFilter.gain
			})
		}
		isEqualizerEnabled = !isEqualizerEnabled
		$selectedEq = $selectedEq
	}

	function selectEqualizer(id: string) {
		let equalizerFound = $equalizers.find(x => x.id === id)

		if (equalizerFound) {
			equalizerFound.values.forEach(eqValue => {
				let audioFilter = $selectedEq.find(x => x.frequency === eqValue.frequency)

				audioFilter.biquadFilter.gain.value = eqValue.gain
			})

			$selectedEq = $selectedEq
		}
	}
</script>

<OptionSection title="Equalizer">
	<equalizer-section slot="body">
		<p>Saved Equalizers</p>
		<equalizer-list>
			{#each $equalizers as eq (eq.id)}
				<equalizer-field>
					<equalizer-name on:click={() => selectEqualizer(eq.id)}>{eq.name}</equalizer-name>
					<equalizer-delete>X</equalizer-delete>
					<equalizer-rename><EditIcon style="height:inherit;width:auto;fill:#fff;" /></equalizer-rename>
				</equalizer-field>
			{/each}
		</equalizer-list>
		<audio-filters>
			{#each $selectedEq as audioFilter, index (index)}
				<audio-filter-range>
					<filter-frequency>{audioFilter.frequency} Hz</filter-frequency>
					<eq-input-container>
						<input
							type="range"
							min="-10"
							max="10"
							value={audioFilter.biquadFilter.gain.value}
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
	equalizer-list {
		width: fit-content;
		max-height: 6rem;
		display: block;
		overflow-y: scroll;
		width: 33%;
		margin: 0 auto;
	}
	equalizer-list equalizer-field {
		height: 1rem;
		display: flex;
	}
	equalizer-list equalizer-field equalizer-name {
		cursor: pointer;
		width: -webkit-fill-available;
	}

	equalizer-list equalizer-field equalizer-delete {
		margin-left: auto;
	}

	equalizer-list equalizer-field equalizer-rename {
		height: inherit;
	}

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
