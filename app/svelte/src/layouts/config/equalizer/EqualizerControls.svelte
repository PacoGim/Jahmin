<script lang="ts">
	import { equalizer, equalizerNameStore, isEqualizerOn, selectedEqName } from '../../../stores/equalizer.store'
	import { equalizerService } from '../../../stores/service.store'

	import objectToArrayFn from '../../../functions/objectToArray.fn'

	$: $equalizerNameStore = getProfileNameFromId($selectedEqName)

	function getProfileNameFromId(eqId: String) {
		if ($equalizerService !== undefined) {
			return $equalizerService.getEqualizerName(eqId)
		} else {
			return ''
		}
	}
</script>

<equalizer-controls-config>
	{#each objectToArrayFn($equalizer) as equalizerProfile, index (index)}
		<audio-filter-range>
			<filter-frequency>{equalizerProfile.frequency.value} Hz</filter-frequency>
			<eq-input-container>
				<input
					type="range"
					min="-8"
					max="8"
					step="1"
					value={equalizerProfile.gain.value}
					on:input={evt => $equalizerService.gainChange(evt, equalizerProfile.frequency.value)}
					disabled={!$isEqualizerOn}
				/>
			</eq-input-container>
			<filter-gain>{equalizerProfile.gain.value} dB</filter-gain>
		</audio-filter-range>
	{/each}
</equalizer-controls-config>

<style>
	equalizer-controls-config {
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
		background-color: var(--color-reactBlue);
		box-shadow: 0px 0px 0px 5px hsl(0, 0%, 90%), 0px 0px 10px 5px rgba(0, 0, 0, 0.25);

		transition: background-color 300ms linear;
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
