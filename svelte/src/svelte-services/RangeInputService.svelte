<script lang="ts">
	import CheckIcon from '../icons/CheckIcon.svelte'

	import DeleteIcon from '../icons/DeleteIcon.svelte'

	import { keyDown } from '../store/final.store'

	import type { InputRangeStateType } from '../types/inputRangeState.type'

	let isRangeInputVisible = false

	let rangeInputValue = 0

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

	export function closeRangeInput() {
		// If User did NOT change value then set it to previous value.
		if (rangeInputValue !== rangeInputState.value) {
			rangeInputState.onCancel(rangeInputState.value)
		}

		isRangeInputVisible = false
	}

	function confirmRangeInput() {
		rangeInputState.value = rangeInputValue
		rangeInputState.onConfirm(rangeInputValue)
		isRangeInputVisible = false
	}
</script>

<range-input-svlt show={isRangeInputVisible}>
	<range-input-container>
		<range-input-input-title>
			{rangeInputState.title}
		</range-input-input-title>

		<input
			type="range"
			min={rangeInputState.min}
			max={rangeInputState.max}
			step={$keyDown === 'Shift' ? rangeInputState.minStep : rangeInputState.step}
			bind:value={rangeInputValue}
		/>

		<range-input-steps-info>Hold <shift-button>⇧ Shift</shift-button> to be more accurate</range-input-steps-info>

		<range-input-value>{rangeInputValue} px</range-input-value>

		<range-input-buttons>
			<button class="cancel" on:click={() => closeRangeInput()}>
				<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
				{rangeInputState.cancelButtonText}
			</button>
			<button class="confirm" disabled={rangeInputValue === rangeInputState.value} on:click={() => confirmRangeInput()}>
				<CheckIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
				{rangeInputState.confirmButtonText}
			</button>
		</range-input-buttons>
	</range-input-container></range-input-svlt
>

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

	range-input-svlt[show='false'] range-input-container {
		pointer-events: none;
		transform: scale(0);
	}

	range-input-svlt[show='true'] {
		transform: scale(1);
	}

	range-input-svlt[show='true'] range-input-container {
		pointer-events: all;
	}

	range-input-container {
		margin-top: 1rem;
		border-radius: 8px;
		padding: 1rem;
		background-color: var(--color-bg-2);

		box-shadow: 0px 0px 8px 8px rgba(0, 0, 0, 0.5);

		transition: transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	range-input-input-title {
		display: block;
		text-align: center;
		font-variation-settings: 'wght' calc(var(--default-weight) + 150);
		margin-bottom: 1rem;
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

	range-input-steps-info {
		margin-top: 0.75rem;
		display: block;
		font-size: 0.8rem;
		text-align: center;
	}

	range-input-steps-info shift-button {
		padding: 0.2rem 0.3rem;
		padding-left: 0.2rem; /* Padding left added to compensate the arrow blank space around. */
		border: 1px solid var(--color-fg-1);
		border-radius: 3px;
		font-size: 0.75rem;
	}

	range-input-value {
		display: block;
		margin: 1rem 0;
		width: 100%;
		text-align: center;
		font-size: 0.9rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 100);
	}

	range-input-buttons {
		display: flex;
		justify-content: space-between;
	}

	range-input-buttons button.cancel {
		background-color: var(--color-hl-2);
	}
</style>
