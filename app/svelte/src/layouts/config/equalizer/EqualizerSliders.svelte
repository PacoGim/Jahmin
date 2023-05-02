<script lang="ts">
	import { equalizer, isEqualizerOn } from '../../../stores/equalizer.store'

	import objectToArrayFn from '../../../functions/objectToArray.fn'
	import equalizerService from '../../../services/equalizer/!equalizer.service'
</script>

<equalizer-sliders-config>
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
					on:input={evt => equalizerService.gainChangeFn(evt.currentTarget, equalizerProfile.frequency.value)}
					disabled={!$isEqualizerOn}
				/>
			</eq-input-container>
			<filter-gain>{equalizerProfile.gain.value} dB</filter-gain>
		</audio-filter-range>
	{/each}
</equalizer-sliders-config>

<style>
	equalizer-sliders-config {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		margin: 0 auto;
		margin-bottom: 1rem;
		width: max-content;
		font-variation-settings: 'wght' 700;
		font-size: 0.9rem;
	}

	audio-filter-range {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 1rem;
	}
	audio-filter-range filter-gain,
	audio-filter-range filter-frequency {
		transition: transform 200ms cubic-bezier(1, -1, 1, 2);
	}

	audio-filter-range:hover filter-gain,
	audio-filter-range:hover filter-frequency {
		transform: scale(1.25);
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
		appearance: none;

		outline: none;

		background-color: var(--color-fg-1);

		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25); /* x | y | blur | spread | color */
	}

	input[type='range']::-webkit-slider-thumb {
		border-radius: 50px;
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		outline: none;
		background-color: var(--color-accent-1);
		box-shadow: 0px 0px 0px 5px var(--color-fg-1), 0px 0px 10px 5px rgba(0, 0, 0, 0.25);

		transition: background-color 300ms linear;
	}

	audio-filter-range eq-input-container {
		margin: 1rem 0;
	}

	audio-filter-range eq-input-container input:disabled {
		cursor: not-allowed;
	}
	audio-filter-range eq-input-container input[type='range']:disabled::-webkit-slider-thumb {
		background-color: var(--color-dangerRed);
	}
</style>
