<script lang="ts">
	import { nanoid } from 'nanoid'
	import TagEditSeparator from './TagEdit-Separator.svelte'

	export let value: string | number = ''
	export let type: 'input' | 'textarea' | 'number' = 'input'
	export let placeholder = undefined
	export let tagName

	let id = nanoid(10)

	function resizeTextArea(id: string, type: 'expand' | 'collapse') {
		let textAreaElement: HTMLTextAreaElement = document.querySelector(`#${CSS.escape(id)}`).querySelector('textarea')

		if (textAreaElement) {
			if (type === 'expand') {
				textAreaElement.style.minHeight = textAreaElement.scrollHeight + 'px'
			} else if (type === 'collapse') {
				textAreaElement.style.minHeight = '0px'
			}
		}
	}
</script>

<tag-edit {id}>
	<tag-name>{tagName}</tag-name>
	{#if type === 'input'}
		<input type="text" {placeholder} bind:value />
	{:else if type === 'number'}
		<input type="number" {placeholder} bind:value />
	{:else if type === 'textarea'}
		<textarea
			rows="1"
			bind:value
			on:mouseleave={() => {
				resizeTextArea(id, 'collapse')
			}}
			on:mouseover={() => {
				resizeTextArea(id, 'expand')
			}}
			on:input={() => {
				resizeTextArea(id, 'expand')
			}}
		/>
	{/if}
	<TagEditSeparator />
</tag-edit>

<style>
	tag-edit {
		display: flex;
		align-items: center;
		flex-direction: column;
		margin-bottom: 0.5rem;
	}

	tag-edit tag-name {
		font-size: 0.9rem;
	}

	tag-edit textarea {
		min-height: 0px;
		overflow-y: hidden;
		transition: min-height 300ms ease-in-out;
		resize: none;
	}

	tag-edit input::placeholder {
		color: #aaa;
	}

	/* tag-edit::after {
		content: '';
		display: block;
		background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(0, 0, 0, 0) 100%);
		height: 3px;
		width: calc(100% - 2rem);
	} */
</style>
