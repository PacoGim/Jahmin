<script lang="ts">
	import CheckIcon from '../icons/CheckIcon.svelte'
	import DeleteIcon from '../icons/DeleteIcon.svelte'
	import notifyService from '../services/notify.service'
	import { keyPressed } from '../stores/main.store'
	import type { PromptStateType } from '../../../types/promptState.type'

	let isPromptVisible = false

	let promptState: PromptStateType = {
		title: '',
		cancelButtonText: '',
		confirmButtonText: '',
		data: {},
		placeholder: '',
		validateFn: undefined
	}

	let promptElement = undefined

	let inputValue = ''

	let deferredPromise = undefined

	$: {
		if (isPromptVisible === true) {
			if (promptElement === undefined) {
				promptElement = document.querySelector('prompt-svlt input') as HTMLInputElement
			}

			promptElement.focus()
		}
	}

	$: if ($keyPressed === 'Escape' && isPromptVisible === true) closePrompt()

	$: {
		promptState
		setInputValueFromData()
	}

	export function showPrompt(newState: PromptStateType) {
		return new Promise((resolve, reject) => {
			promptState = newState

			deferredPromise = resolve

			isPromptVisible = true
		})
	}

	export function closePrompt() {
		deferredPromise = undefined
		isPromptVisible = false
	}

	function setInputValueFromData() {
		inputValue = promptState?.data?.inputValue || ''
	}

	function confirmPrompt() {
		let validatedInput = promptState.validateFn(inputValue)

		if (validatedInput.isValid === true) {
			deferredPromise({
				data: Object.assign(promptState.data, { result: inputValue })
			})
		} else {
			notifyService.error(validatedInput.errorMessage)
		}
	}

	function handleOutsidePromptClick(e: MouseEvent) {
		let doClosePrompt = true

		e.composedPath().forEach((element: HTMLElement) => {
			if (element.tagName === 'PROMPT-CONTENT') {
				doClosePrompt = false
			}
		})

		if (doClosePrompt) closePrompt()
	}

	function handleInputKeypress(evt: KeyboardEvent) {
		if (evt.key === 'Enter') confirmPrompt()
	}
</script>

<prompt-svlt show={isPromptVisible} on:click={e => handleOutsidePromptClick(e)} on:keypress={e => handleOutsidePromptClick(e)} tabindex="-1" role="button">
	<prompt-content>
		<prompt-close on:click={() => closePrompt()} on:keypress={() => closePrompt()} tabindex="-1" role="button">x</prompt-close>
		<prompt-title>{promptState.title}</prompt-title>
		<prompt-body>
			<input
				slot="body"
				type="text"
				placeholder={promptState.placeholder}
				bind:value={inputValue}
				on:keypress={evt => handleInputKeypress(evt)}
			/>
		</prompt-body>
		<prompt-footer>
			<button class="cancel" on:click={() => closePrompt()} tabindex="-1">
				<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
				{promptState.cancelButtonText}
			</button>
			<button class="confirm" on:click={() => confirmPrompt()}>
				<CheckIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
				{promptState.confirmButtonText}
			</button>
		</prompt-footer>
	</prompt-content>
</prompt-svlt>

<style>
	prompt-svlt {
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

	prompt-svlt[show='false'] {
		pointer-events: none;
		opacity: 0;
	}

	prompt-svlt[show='true'] {
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

	prompt-svlt[show='false'] prompt-content {
		transform: scale(0);
	}

	prompt-svlt[show='true'] prompt-content {
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

		color: var(--color-fg-1);
		background-color: var(--color-bg-3);
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
		display: flex;
		margin-left: auto;
		width: max-content;
	}

	prompt-content prompt-footer button.confirm {
		margin-left: 1rem;
	}

	prompt-content prompt-footer button.cancel {
		background-color: var(--color-dangerRed);
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
		border-bottom: 2px var(--color-accent-1) solid;
	}
</style>
