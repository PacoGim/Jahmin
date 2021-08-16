<script lang="ts">
	import { nanoid } from 'nanoid'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	import TagEditSeparator from './TagEdit-Separator.svelte'

	export let value: string | number = ''
	export let type: 'text' | 'textarea' | 'number' = 'text'
	export let showUndo = false
	export let placeholder = undefined
	export let tagName
	export let warningMessage = undefined

	$: {
		if (value && value !== '-' && type === 'number') {
			if (typeof value === 'string') {
				value = value.replace(/[^\d]/g, '')
			}
		}
	}

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
	<tag-name>
		{tagName}

		<warning title={warningMessage} style={warningMessage === undefined ? 'display:none' : ''}>(❗)</warning>

		{#if showUndo}
			<img class="undoIcon" on:click={() => dispatch('undoChange')} src="./img/undo-arrow-svgrepo-com.svg" alt="" />
		{/if}
	</tag-name>
	{#if ['text', 'number'].includes(type)}
		<input type="text" {placeholder} bind:value />
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
			on:focus={()=>{}}
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
		display: flex;
		align-items: center;
	}

	tag-edit tag-name warning {
		filter: grayscale(1) brightness(10);
		transform: scale(0.9);
		line-height: 0;
		margin-left: 5px;
		cursor: help;
	}

	tag-edit tag-name img.undoIcon {
		cursor: pointer;
		height: 0.9rem;
		filter: invert(1);
		margin-left: 5px;
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
