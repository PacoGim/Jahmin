<script lang="ts">
	import CheckIcon from '../icons/CheckIcon.svelte'

	import DeleteIcon from '../icons/DeleteIcon.svelte'

	import { keyDown } from '../store/final.store'

	import type { InputRangeStateType } from '../types/inputRangeState.type'

	let isRangeInputVisible = false

	let rangeInputValue

	let rangeInputState: InputRangeStateType = {
		title: '',
		min: 0,
		value: 0,
		max: 100,
		step: 1,
		minStep: 1,
		cancelButtonText: '',
		confirmButtonText: '',
		onChange: () => {},
		onConfirm: () => {},
		onCancel: () => {}
	}

	$: {
		rangeInputValue
		sendNewValue()
	}

	$: {
		setRangeInputValueBind(rangeInputState)
	}

	function setRangeInputValueBind(state: InputRangeStateType) {
		if (state?.value) {
			rangeInputValue = state.value
		}
	}

	function sendNewValue() {
		if (rangeInputState.onChange !== undefined) {
			rangeInputState.onChange(rangeInputValue)
		}
	}

	export function showRangeInput(newState: InputRangeStateType) {
		rangeInputState = newState
		isRangeInputVisible = true
	}

	function closeRangeInput() {
		// If User did NOT change value then set it to previous value.
		if (rangeInputValue !== rangeInputState.value) {
			rangeInputState.onCancel(rangeInputState.value)
		}

		isRangeInputVisible = false
	}

	function confirmRangeInput() {
		rangeInputState.value = rangeInputValue
		rangeInputState.onConfirm(rangeInputValue)
	}
</script>

<range-input-svlt show={isRangeInputVisible}>
	<range-input-container>
		<input
			type="range"
			min={rangeInputState.min}
			max={rangeInputState.max}
			step={$keyDown === 'Shift' ? rangeInputState.minStep : rangeInputState.step}
			bind:value={rangeInputValue}
		/>
		<p>{rangeInputValue} px</p>

		<range-input-cancel class="input-range-button" on:click={() => closeRangeInput()}>
			<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
			{rangeInputState.cancelButtonText}
		</range-input-cancel>
		<range-input-confirm class="input-range-button" on:click={() => confirmRangeInput()}>
			<CheckIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
			{rangeInputState.confirmButtonText}
		</range-input-confirm>
	</range-input-container>
</range-input-svlt>

<style>
	range-input-svlt {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;

		z-index: 100;
		display: flex;
		justify-content: center;

		pointer-events: none;
	}

	range-input-svlt[show='false'] {
		opacity: 0;
	}

	range-input-svlt[show='false'] range-input-container {
		pointer-events: none;
	}

	range-input-svlt[show='true'] {
		opacity: 1;
	}

	range-input-svlt[show='true'] range-input-container {
		pointer-events: all;
	}

	range-input-container {
		background-color: var(--color-bg-2);
	}

	range-input-container input {
		width: 256px;
		cursor: pointer;
		border-radius: 50px;

		height: 10px;

		-webkit-appearance: none;

		outline: none;

		background-color: hsl(0, 0%, 90%);

		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25); /* x | y | blur | spread | color */
	}

	range-input-container input[type='range']::-webkit-slider-thumb {
		border-radius: 50px;
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		outline: none;
		background-color: var(--color-hl-1);
		box-shadow: 0px 0px 0px 5px hsl(0, 0%, 90%), 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
	}

	.input-range-button {
		display: flex;
		align-items: center;
		font-size: 0.85rem;
		font-variation-settings: 'wght' 500;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	range-input-confirm {
		background-color: var(--color-hl-1);
	}

	range-input-cancel {
		background-color: var(--color-hl-2);
	}
</style>
