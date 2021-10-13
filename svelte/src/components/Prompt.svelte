<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'

	const dispatch = createEventDispatcher()

	export let showModal
	export let title = ''
	export let cancelButtonText = 'Cancel'
	export let confirmButtonText = 'Cancel'
	export let placeholder

	export let data

	let inputValue = ''

	$: {
		if (data?.inputValue) setInputValueFromData()
	}

	function setInputValueFromData() {
		inputValue = data.inputValue
	}

	function closeModal() {
		dispatch('close')
	}

	function confirmModal() {
		dispatch('response', Object.assign(data, { response: inputValue }))
	}

	function handleOutsidePromptClick(e: MouseEvent) {
		let doCloseModal = true

		e.composedPath().forEach((element: HTMLElement) => {
			if (element.tagName === 'PROMPT-CONTENT') {
				doCloseModal = false
			}
		})

		if (doCloseModal) closeModal()
	}

	function handleInputKeypress(evt: KeyboardEvent) {
		if (evt.key === 'Enter') confirmModal()
	}
</script>

<prompt-svelte show={showModal} on:click={e => handleOutsidePromptClick(e)}>
	<prompt-content>
		<prompt-close on:click={() => closeModal()}>x</prompt-close>
		<prompt-title>{title}</prompt-title>
		<prompt-body>
			<input slot="body" type="text" {placeholder} bind:value={inputValue} on:keypress={evt => handleInputKeypress(evt)} />
		</prompt-body>
		<prompt-footer>
			<prompt-cancel class="prompt-button" on:click={() => closeModal()}>{cancelButtonText}</prompt-cancel>
			<prompt-confirm class="prompt-button" on:click={() => confirmModal()}>{confirmButtonText}</prompt-confirm>
		</prompt-footer>
	</prompt-content>
</prompt-svelte>

<style>
	prompt-svelte {
		--prompt-border-radius: 4px;

		position: fixed;
		top: 0;
		left: 0;

		display: flex;

		justify-content: center;
		align-items: center;

		width: 100%;
		height: 100%;

		z-index: 20;

		background-color: rgba(0, 0, 0, 0.5);

		transition: opacity 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	prompt-svelte[show='false'] {
		pointer-events: none;
		opacity: 0;
	}

	prompt-svelte[show='true'] {
		pointer-events: all;
		opacity: 1;
	}

	prompt-content {
		background-color: var(--color-bg-1);
		color: var(--color-fg-1);
		width: 33%;
		height: max-content;
		display: block;

		border-radius: var(--prompt-border-radius);
		border-top-right-radius: 8px; /* Prevents close button "overlap" */

		padding: 1rem;

		position: relative;

		transition: transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	prompt-svelte[show='false'] prompt-content {
		transform: scale(0);
	}

	prompt-svelte[show='true'] prompt-content {
		/* transform: scale(0); */
		transform: scale(1);
	}

	prompt-content prompt-close {
		display: flex;
		align-items: center;
		justify-content: center;

		top: 0;
		right: 0;
		position: absolute;
		font-variation-settings: 'wght' 500;

		border-top-right-radius: var(--prompt-border-radius);

		font-size: 1.2rem;
		cursor: pointer;
		height: 2rem;
		width: 2rem;

		color: #fff;
		background-color: #0a0a0a;
	}

	prompt-content prompt-title {
		display: block;
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	prompt-content prompt-body {
		display: block;
		margin-bottom: 1rem;
	}

	prompt-content prompt-footer {
		display: block;
		margin-left: auto;
		width: max-content;
	}

	prompt-content prompt-footer *.prompt-button {
		font-size: 0.85rem;
		font-variation-settings: 'wght' 500;
		cursor: pointer;
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	prompt-content prompt-footer prompt-confirm {
		margin-left: 1rem;

		background-color: var(--color-hl-1);
	}

	prompt-content prompt-footer prompt-cancel {
		background-color: crimson;
	}

	input {
		display: block;
		/* height: 1rem; */
		font-size: 1rem;
		font-family: inherit;
		background-color: var(--color-bg-2);
		color: var(--color-fg-1);
		border: none;
		width: 100%;
		padding: 0.5rem 1rem;

		border-radius: 4px 4px 0 0;

		border-bottom: 2px var(--color-fg-1) solid;

		transition-property: background-color, color, border-bottom;
		transition-duration: var(--theme-transition-duration), var(--theme-transition-duration), 300ms;
		transition-timing-function: linear;
	}

	input:active,
	input:focus {
		border-bottom: 2px var(--color-hl-1) solid;
	}
</style>
