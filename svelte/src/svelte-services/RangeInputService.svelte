<script lang="ts">
	let isRangeInputVisible = true
	let rangeInputElement = undefined

	let inputValue = ''

	let deferredPromise = undefined

	$: {
		if (isRangeInputVisible === true) {
			if (rangeInputElement === undefined) {
				rangeInputElement = document.querySelector('range-input-svlt input') as HTMLInputElement
			}
		}
	}

	export function showPrompt(newState: PromptStateType) {
		return new Promise((resolve, reject) => {
			rangeInputState = newState

			deferredPromise = resolve

			isRangeInputVisible = true
		})
	}

	export function closePrompt() {
		deferredPromise = undefined
		isRangeInputVisible = false
	}

	function setInputValueFromData() {
		inputValue = rangeInputState?.data?.inputValue || ''
	}

	function confirmPrompt() {
		deferredPromise({
			data: Object.assign(rangeInputState.data, { result: inputValue })
		})
	}
</script>

<range-input-svlt show={isRangeInputVisible}>
	<input type="range" min="" max="" step="" value=""/>
</range-input-svlt>

<style>
	range-input-svlt {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		z-index: 100;
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}
</style>
