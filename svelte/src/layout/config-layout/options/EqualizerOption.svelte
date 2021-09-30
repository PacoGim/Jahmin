<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import EditIcon from '../../../icons/EditIcon.svelte'
	import { equalizerProfiles, selectedEqId } from '../../../store/equalizer.store'
	import type { EqualizerType } from '../../../types/equalizer.type'

	let isEqualizerEnabled = true

	// let audioFiltersCopy: EqualizerType = $selectedEq

	function gainChange(evt: Event, frequency: number) {
		const target = evt.target as HTMLInputElement
		const value = Number(target.value)

		// let audioFilter = $selectedEq.values.find(x => x.frequency === frequency)

		// audioFilter.gain = value

		// $selectedEq = $selectedEq
	}

	$: {
		// console.log($selectedEq)
	}

	/* 	function toggleEq() {
		if (isEqualizerEnabled === true) {
			$selectedEq.values.forEach(audioFilter => (audioFilter.biquadFilter.gain.value = 0))
		} else {
			audioFiltersCopy.values.forEach(audioFilter => {
				$selectedEq.values.find(x => x.frequency === audioFilter.frequency).biquadFilter.gain.value = audioFilter.gain
			})
		}
		isEqualizerEnabled = !isEqualizerEnabled
		$selectedEq = $selectedEq
	} */

	/* 	function selectEqualizer(id: string) {
		let equalizerFound = $equalizers.find(x => x.id === id)

		if (equalizerFound) {
			equalizerFound.values.forEach(eqValue => {
				console.log(eqValue)
			})
		}

		/*

		if (equalizerFound) {
			equalizerFound.values.forEach(eqValue => {
				let audioFilter = $selectedEq.values.find(x => x.frequency === eqValue.frequency)

				audioFilter.biquadFilter.gain.value = eqValue.gain

				audioFilter.gain = eqValue.gain
			})

			$selectedEq.id = equalizerFound.id
			$selectedEq.name = equalizerFound.name
			$selectedEq = $selectedEq
		}

	} */

	function renameEq(id: string) {}

	function deleteEq(id: string) {}

	function selectEqualizer(id: string) {
		console.log(id)
	}

	function toggleEq(){

	}
</script>

<OptionSection title="Equalizer">
	<equalizer-section slot="body">
		<p>Saved Equalizers</p>
		<equalizer-list>
			{#each $equalizerProfiles as eq (eq.id)}
				<equalizer-field id="eq-{eq.id}">
					<equalizer-name on:click={() => selectEqualizer(eq.id)}>{eq.name}</equalizer-name>
					<equalizer-rename on:click={() => renameEq(eq.id)}
						>Rename <EditIcon style="height:1rem;width:auto;fill:#fff;" /></equalizer-rename
					>
					<equalizer-delete on:click={() => deleteEq(eq.id)}>Delete X</equalizer-delete>
				</equalizer-field>
			{/each}
		</equalizer-list>
		<audio-filters>
			{#each $selectedEq.values as audioFilter, index (index)}
				<audio-filter-range>
					<filter-frequency>{audioFilter.frequency} Hz</filter-frequency>
					<eq-input-container>
						<input
							type="range"
							min="-10"
							max="10"
							step="1"
							value={audioFilter.gain}
							on:input={evt => {
								gainChange(evt, audioFilter.frequency)
							}}
						/>
					</eq-input-container>
					<filter-gain>{audioFilter.gain} dB</filter-gain>
				</audio-filter-range>
			{/each}
		</audio-filters>
		<button class={isEqualizerEnabled ? 'active' : 'not-active'} on:click={() => toggleEq()}>Toggle EQ</button>
	</equalizer-section>
</OptionSection>

<style>
	equalizer-list {
		width: fit-content;
		max-height: 10rem;
		display: block;
		overflow-y: scroll;
		width: 33%;
		margin: 0 auto;
	}
	equalizer-list equalizer-field {
		cursor: pointer;
		display: grid;
		grid-template-columns: auto max-content max-content;
		transition: background-color 150ms ease-in-out;
	}

	equalizer-list equalizer-field * {
		transition: background-color 150ms ease-in-out;
	}

	equalizer-list equalizer-field:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	equalizer-list equalizer-field equalizer-name {
		padding: 0.25rem 0.5rem;
	}

	equalizer-list equalizer-field equalizer-rename {
		padding: 0.25rem 0.5rem;
		height: inherit;
		margin-right: 1rem;
	}

	equalizer-list equalizer-field equalizer-rename:hover {
		background-color: cornflowerblue;
	}

	equalizer-list equalizer-field equalizer-delete {
		margin-right: 1rem;
		padding: 0.25rem 0.5rem;
	}

	equalizer-list equalizer-field equalizer-delete:hover {
		background-color: crimson;
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
		--bar-height: 250px;
		width: var(--bar-width);
		height: var(--bar-height);
	}

	input {
		width: var(--bar-height);
		height: var(--bar-width);
		transform-origin: calc(var(--bar-height) / 2) calc(var(--bar-height) / 2);
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
