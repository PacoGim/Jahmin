<script lang="ts">
	import { keypress } from '../store/final.store'
	import type { ConfirmStateType } from '../types/confirmState.type'

	let isConfirmVisible = false
	let confirmState: ConfirmStateType = {
		data: {},
		textToConfirm: '',
		title: ''
	}

	let deferredPromise = undefined

	$: if ($keypress === 'Escape' && isConfirmVisible === true) closeConfirm()
	$: if ($keypress === 'Enter' && isConfirmVisible === true) confirmConfirm()

	export function showConfirm(newState: ConfirmStateType) {
		return new Promise((resolve, reject) => {
			confirmState = newState

			deferredPromise = resolve

			isConfirmVisible = true
		})
	}

	export function closeConfirm() {
		deferredPromise = undefined
		isConfirmVisible = false
	}

	function confirmConfirm() {
		deferredPromise({ id: confirmState.data.id })
	}

	function handleOutsidePromptClick(e: MouseEvent) {
		let doCloseConfirm = true

		e.composedPath().forEach((element: HTMLElement) => {
			if (element.tagName === 'CONFIRM-CONTENT') {
				doCloseConfirm = false
			}
		})

		if (doCloseConfirm) closeConfirm()
	}
</script>

<confirm-svelte show={isConfirmVisible} on:click={e => handleOutsidePromptClick(e)}>
	<confirm-content>
		<confirm-close on:click={() => closeConfirm()}>x</confirm-close>
		<confirm-title>{confirmState.title}</confirm-title>
		<confirm-body>
			{confirmState.textToConfirm}
		</confirm-body>
		<confirm-footer>
			<confirm-cancel class="confirm-button" on:click={() => closeConfirm()}>Cancel</confirm-cancel>
			<confirm-confirm class="confirm-button" on:click={() => confirmConfirm()}>Confirm</confirm-confirm>
		</confirm-footer>
	</confirm-content>
</confirm-svelte>

<style>
	confirm-svelte {
		--confirm-border-radius: 4px;

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

	confirm-svelte[show='false'] {
		pointer-events: none;
		opacity: 0;
	}

	confirm-svelte[show='true'] {
		pointer-events: all;
		opacity: 1;
	}

	confirm-content {
		background-color: var(--color-bg-1);
		color: var(--color-fg-1);
		width: 33%;
		height: max-content;
		display: block;

		border-radius: var(--confirm-border-radius);
		border-top-right-radius: 8px; /* Prevents close button "overlap" */

		padding: 1rem;

		position: relative;

		transition: transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	confirm-svelte[show='false'] confirm-content {
		transform: scale(0);
	}

	confirm-svelte[show='true'] confirm-content {
		/* transform: scale(0); */
		transform: scale(1);
	}

	confirm-content confirm-close {
		display: flex;
		align-items: center;
		justify-content: center;

		top: 0;
		right: 0;
		position: absolute;
		font-variation-settings: 'wght' 500;

		border-top-right-radius: var(--confirm-border-radius);

		font-size: 1.2rem;
		cursor: pointer;
		height: 2rem;
		width: 2rem;

		color: #fff;
		background-color: #0a0a0a;
	}

	confirm-content confirm-title {
		display: block;
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	confirm-content confirm-body {
		display: block;
		margin-bottom: 1rem;
	}

	confirm-content confirm-footer {
		display: block;
		margin-left: auto;
		width: max-content;
	}

	confirm-content confirm-footer *.confirm-button {
		font-size: 0.85rem;
		font-variation-settings: 'wght' 500;
		cursor: pointer;
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	confirm-content confirm-footer confirm-confirm {
		margin-left: 1rem;

		background-color: var(--color-hl-1);
	}

	confirm-content confirm-footer confirm-cancel {
		background-color: var(--color-hl-2);
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
