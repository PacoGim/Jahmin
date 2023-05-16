<script lang="ts">
	import { onMount } from 'svelte'
	import renderLyricsFn from '../../functions/renderLyrics.fn'
	import updateConfigFn from '../../functions/updateConfig.fn'
	import TextAlignCenterIcon from '../../icons/TextAlignCenterIcon.svelte'
	import TextAlignLeftcon from '../../icons/TextAlignLeftcon.svelte'
	import TextAlignRightIcon from '../../icons/TextAlignRightIcon.svelte'
	import cssVariablesService from '../../services/cssVariables.service'
	import { config } from '../../stores/config.store'

	export let lyrics

	let lyricsContainer: HTMLElement

	$: if ((lyrics || lyrics === null) && lyricsContainer) renderLyricsFn(lyrics, lyricsContainer)

	function updateTextAlign(newTextAlign: 'left' | 'center' | 'right') {
		updateConfigFn({
			userOptions: {
				lyricsTextAlign: newTextAlign
			}
		})

		cssVariablesService.set('lyrics-text-align', newTextAlign)
	}

	function updateTextSize(sign: string) {
		let configValue = $config.userOptions.lyricsTextSize

		if (sign === '+') {
			configValue = configValue + 1
		} else if (sign === '-') {
			configValue = configValue - 1
		}

		if (configValue > 32) {
			configValue = 32
		} else if (configValue < 8) {
			configValue = 8
		}

		updateConfigFn({
			userOptions: {
				lyricsTextSize: configValue
			}
		})

		cssVariablesService.set('lyrics-text-size', configValue + 'px')
	}

	function updateTextWeight(sign: string) {
		let configValue = $config.userOptions.lyricsTextWeight

		if (sign === '+') {
			configValue = configValue + 50
		} else if (sign === '-') {
			configValue = configValue - 50
		}

		if (configValue > 1000) {
			configValue = 1000
		} else if (configValue < 100) {
			configValue = 100
		}

		updateConfigFn({
			userOptions: {
				lyricsTextWeight: configValue
			}
		})

		cssVariablesService.set('lyrics-text-weight', configValue)
	}

	onMount(() => {
		cssVariablesService.set('lyrics-text-align', $config.userOptions.lyricsTextAlign)
		cssVariablesService.set('lyrics-text-size', $config.userOptions.lyricsTextSize + 'px')
		cssVariablesService.set('lyrics-text-weight', $config.userOptions.lyricsTextWeight)
	})
</script>

<lyrics-read>
	<lyrics-read-controls>
		<text-alignment class="controls-container">
			<text-alignment-buttons class="controls-buttons">
				<icon-wrapper on:click={() => updateTextAlign('left')} class="icon">
					<TextAlignLeftcon style="height: 1.5rem; fill: var(--color-bg-1);" />
				</icon-wrapper>
				<icon-wrapper on:click={() => updateTextAlign('center')} class="icon">
					<TextAlignCenterIcon style="height: 1.5rem; fill: var(--color-bg-1);" />
				</icon-wrapper>
				<icon-wrapper on:click={() => updateTextAlign('right')} class="icon">
					<TextAlignRightIcon style="height: 1.5rem; fill: var(--color-bg-1);" />
				</icon-wrapper>
			</text-alignment-buttons>
			<text-alignment-value class="controls-value" style="text-transform: capitalize;">
				{$config.userOptions.lyricsTextAlign}
			</text-alignment-value>
		</text-alignment>

		<text-size class="controls-container">
			<text-size-buttons class="controls-buttons">
				<custom-icon on:click={() => updateTextSize('-')} class="icon" style="font-size: 0.8rem;">Aa</custom-icon>
				<custom-icon on:click={() => updateTextSize('+')} class="icon" style="font-size: 1.2rem;">Aa</custom-icon>
			</text-size-buttons>
			<text-size-value class="controls-value"> {$config.userOptions.lyricsTextSize}px </text-size-value>
		</text-size>

		<text-weight class="controls-container">
			<text-weight-buttons class="controls-buttons">
				<custom-icon on:click={() => updateTextWeight('-')} class="icon" style="font-variation-settings: 'wght' 500;"
					>B</custom-icon
				>
				<custom-icon on:click={() => updateTextWeight('+')} class="icon" style="font-variation-settings: 'wght' 900;"
					>B</custom-icon
				>
			</text-weight-buttons>

			<text-weight-value class="controls-value"> {$config.userOptions.lyricsTextWeight} </text-weight-value>
		</text-weight>
	</lyrics-read-controls>
	<lyrics-container bind:this={lyricsContainer} />
</lyrics-read>

<style>
	lyrics-container {
		display: block;
		padding: 3rem;
		padding-top: 2rem;
	}

	:global(lyrics-container p) {
		text-align: var(--lyrics-text-align);
		font-size: var(--lyrics-text-size);
		font-variation-settings: 'wght' var(--lyrics-text-weight);
		line-height: normal;

		transition-property: opacity, transform, font-variation-settings, font-size;
		transition-duration: 1000ms, 1000ms, 300ms, 300ms;
		transition-timing-function: ease-in-out;
	}

	lyrics-read-controls {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.controls-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0 1rem;
	}

	.controls-buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-bg-1);
	}

	.controls-buttons .icon {
		background-color: var(--color-fg-1);
		display: flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		width: 40px;
		margin: 0 0.5rem;
		border-radius: 3px;
		cursor: pointer;
	}

	.controls-value {
		margin-top: 0.5rem;
	}
</style>
