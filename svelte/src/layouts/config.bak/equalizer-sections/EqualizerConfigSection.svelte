<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'

	import { objectToArray } from '../../../services/index.service'
	import { equalizer, isEqualizerDirty, isEqualizerOn, selectedEqId } from '../../../store/equalizer.store'
	import { equalizerService } from '../../../store/service.store'

	let equalizerName = ''

	$: equalizerName = getProfileNameFromId($selectedEqId)

	function getProfileNameFromId(eqId: String) {
		if ($equalizerService !== undefined) {
			return $equalizerService.getEqualizerName(eqId)
		} else {
			return ''
		}
	}
</script>

<OptionSection title="Equalizer - {equalizerName} {$isEqualizerDirty && $isEqualizerOn ? '•' : ''}">
	<equalizer-section slot="body">
		{#each objectToArray($equalizer) as equalizer, index (index)}
			<audio-filter-range>
				<filter-frequency>{equalizer.frequency.value} Hz</filter-frequency>
				<eq-input-container>
					<input
						type="range"
						min="-8"
						max="8"
						step="1"
						value={equalizer.gain.value}
						on:input={evt => $equalizerService.gainChange(evt, equalizer.frequency.value)}
						disabled={!$isEqualizerOn}
					/>
				</eq-input-container>
				<filter-gain>{equalizer.gain.value} dB</filter-gain>
			</audio-filter-range>
		{/each}
	</equalizer-section>
</OptionSection>

<style>
	equalizer-section {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		margin: 0 auto;
		margin-bottom: 1rem;
		width: max-content;
	}
	audio-filter-range {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 1rem;
	}

	eq-input-container {
		--bar-width: 10px;
		--bar-height: 250px;
		width: var(--bar-width);
		height: var(--bar-height);
	}

	input[type='range'] {
		cursor: pointer;
		border-radius: 50px;
		width: var(--bar-height);
		height: var(--bar-width);
		transform-origin: calc(var(--bar-height) / 2) calc(var(--bar-height) / 2);
		transform: rotate(-90deg);

		-webkit-appearance: none;

		outline: none;

		background-color: hsl(0, 0%, 90%);

		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25); /* x | y | blur | spread | color */
	}

	input[type='range']::-webkit-slider-thumb {
		border-radius: 50px;
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		outline: none;
		background-color: var(--color-hl-1);
		box-shadow: 0px 0px 0px 5px hsl(0, 0%, 90%), 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
	}

	audio-filter-range eq-input-container {
		margin: 1rem 0;
	}

	audio-filter-range eq-input-container input:disabled {
		cursor: not-allowed;
	}
	audio-filter-range eq-input-container input[type='range']:disabled::-webkit-slider-thumb {
		background-color: var(--color-hl-2);
	}

	audio-filter-range filter-frequency {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 500;
	}

	audio-filter-range filter-gain {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 500;
	}
</style>
