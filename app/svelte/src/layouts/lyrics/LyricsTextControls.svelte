<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'
	import updateConfigFn from '../../functions/updateConfig.fn'

	const dispatch = createEventDispatcher()

	export let fontWeight
	export let fontSize
	export let textAlignment
	export let lyricsMode: 'Read' | 'Edit' | 'Disabled'

	$: {
		dispatch('fontWeightChange', fontWeight)
		updateConfigFn({
			userOptions: {
				lyricsStyle: {
					fontWeight
				}
			}
		})
	}

	$: {
		dispatch('fontSizeChange', fontSize)
		updateConfigFn({
			userOptions: {
				lyricsStyle: {
					fontSize
				}
			}
		})
	}

	$: {
		dispatch('textAlignmentChange', textAlignment)
		updateConfigFn({
			userOptions: {
				lyricsStyle: {
					textAlignment
				}
			}
		})
	}

	function onTextControlElementMouseEnterLeave(evt, state: 'addActiveClass' | 'removeActiveClass') {
		let parentElement = evt.currentTarget as HTMLElement

		let rangeInputElement = parentElement.querySelector('range-input') as HTMLElement
		let textControlNameElement = parentElement.querySelector('text-control-name') as HTMLElement

		if (state === 'addActiveClass') {
			rangeInputElement.classList.add('active')
			textControlNameElement.style.borderRadius = '0px 0px 4px 4px'
		} else {
			rangeInputElement.classList.remove('active')
			textControlNameElement.style.borderRadius = '4px'
		}
	}

	onMount(() => {
		let textControlElements = document.querySelectorAll('.text-control')

		textControlElements.forEach(element => {
			element.addEventListener('click', evt => onTextControlElementMouseEnterLeave(evt, 'addActiveClass'))
			element.addEventListener('mouseleave', evt => onTextControlElementMouseEnterLeave(evt, 'removeActiveClass'))
		})
	})
</script>

<lyrics-read-edit-controls class={lyricsMode.toLowerCase()}>
	<text-weight class="text-control">
		<text-control-name> Text Weight : {fontWeight} </text-control-name>

		<range-input>
			<input type="range" min="200" max="1000" step="50" bind:value={fontWeight} />
		</range-input>
	</text-weight>

	<text-size class="text-control">
		<text-control-name> Text Size : {fontSize} </text-control-name>

		<range-input>
			<input type="range" min="8" max="24" bind:value={fontSize} />
		</range-input>
	</text-size>

	<text-align class="text-control">
		<text-control-name> Text Alignement : {['Left', 'Center', 'Right'][textAlignment]}</text-control-name>

		<range-input>
			<input type="range" min="0" max="2" bind:value={textAlignment} />
		</range-input>
	</text-align>
</lyrics-read-edit-controls>

<style>
	lyrics-read-edit-controls {
		display: grid;

		grid-template-columns: 160px 125px 200px;

		margin: 0 1rem;
		justify-content: center;

		grid-area: lyrics-read-edit-controls;

		opacity: 1;
		pointer-events: all;

		transition: opacity 300ms ease-in-out;
	}

	lyrics-read-edit-controls.disabled {
		opacity: 0;
		pointer-events: none;
	}

	.text-control {
		display: flex;
		flex-direction: column;
		text-align: center;
		justify-content: center;

		cursor: pointer;

		position: relative;

		margin: 0 0.5rem;
	}

	text-control-name {
		background-color: var(--color-accent-1);
		padding: 0.25rem 0.5rem;
		font-size: 0.85rem;
		border-radius: 4px;
		font-variation-settings: 'wght' 600;
		color: #fff;
		z-index: 2;

		transition: border-radius 500ms linear;
	}

	range-input {
		display: flex;
		justify-content: center;
		position: absolute;
		transform: translateY(0);

		width: 100%;
		z-index: 1;

		background-color: var(--color-bg-3);

		box-shadow: inset 0 0 0 2px var(--color-accent-1);

		transition: all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	:global(range-input.active) {
		transform: translateY(-84%);
		padding: 1rem 0;
	}

	input[type='range'] {
		--bar-height: calc(100% - 24px);
		--bar-width: 6px;

		cursor: pointer;
		border-radius: 50vmax;
		width: var(--bar-height);
		height: var(--bar-width);
		transform-origin: calc(var(--bar-height) / 2) calc(var(--bar-height) / 2);

		-webkit-appearance: none;
		appearance: none;

		outline: none;

		background-color: #fff;

		box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, 0.2);
	}

	input[type='range']::-webkit-slider-thumb {
		border-radius: 100vmax;
		-webkit-appearance: none;
		width: 12px;
		height: 12px;
		outline: none;
		background-color: var(--color-accent-1);
		box-shadow: 0px 0px 0px 4px #fff, 0px 0px 4px 6px rgba(0, 0, 0, 0.2);

		transition: background-color 300ms linear;
	}
</style>
