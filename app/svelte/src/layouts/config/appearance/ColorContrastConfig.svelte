<script lang="ts">
	import InputShiftInfo from '../../../components/InputShiftInfo.svelte'
	import applyColorSchemeFn from '../../../functions/applyColorScheme.fn'
	import getAlbumColors from '../../../functions/getAlbumColors.fn'
	import notifyService from '../../../services/notify.service'
	// import { contrastRatioConfig } from '../../../stores/config.store'
	import { albumPlayingDirStore, config, keyPressed } from '../../../stores/main.store'

	let colorContrastRangeValue = $config.userOptions.contrastRatio

	$: {
		$albumPlayingDirStore
		colorContrastRangeValue
		updateColor()
	}

	function updateColor() {
		getAlbumColors($albumPlayingDirStore, colorContrastRangeValue).then(color => {
			applyColorSchemeFn(color)
		})
	}

	function saveContrastRatio() {
		$config.userOptions.contrastRatio = colorContrastRangeValue
 		window.ipc.saveConfig({
			userOptions: {
				contrastRatio: colorContrastRangeValue
			}
		}).then(() => {
			notifyService.success('Contrast Ratio saved!')
		})
	}
</script>

<color-contrast-config>
	<current-contrast-value
		>{colorContrastRangeValue}
		{colorContrastRangeValue === 4.5 ? ' Suggested' : ''}</current-contrast-value
	>
	<input
		type="range"
		min="0"
		max="21"
		on:change={() => saveContrastRatio()}
		step={$keyPressed === 'Shift' ? 0.1 : 0.5}
		bind:value={colorContrastRangeValue}
	/>

	<InputShiftInfo />

	<current-contrast-sample>Sample</current-contrast-sample>
</color-contrast-config>

<style>
	input {
		display: block;
		width: var(--clamp-width);
		margin: 0 auto;
	}

	current-contrast-value {
		text-align: center;
		display: block;
		margin-bottom: 0.5rem;
	}

	current-contrast-sample {
		display: block;
		width: max-content;
		background: var(--art-color-light);
		color: var(--art-color-dark);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		margin: 0 auto;
		margin-top: 1rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);

		transition-property: color background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;
	}
</style>
