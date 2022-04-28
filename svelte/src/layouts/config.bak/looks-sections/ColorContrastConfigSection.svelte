<script lang="ts">
	import InputShiftInfo from '../../../components/InputShiftInfo.svelte'
	import OptionSection from '../../../components/OptionSection.svelte'
	import applyColorSchemeFn from '../../../functions/applyColorScheme.fn'
	import { getAlbumColors } from '../../../functions/getAlbumColors.fn'
	import { saveConfig } from '../../../services/ipc.service'
	import notifyService from '../../../services/notify.service'
	import { contrastRatioConfig } from '../../../store/config.store'
	import { albumPlayingDirStore, keyDown } from '../../../store/final.store'

	let colorContrastRangeValue = $contrastRatioConfig

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
		localStorage.setItem('ContrastRatio', String(colorContrastRangeValue))
		$contrastRatioConfig = colorContrastRangeValue
		saveConfig({
			userOptions: {
				contrastRatio: colorContrastRangeValue
			}
		}).then(() => {
			notifyService.success('Contrast Ratio saved!')
		})
	}
</script>

<OptionSection title="Contrast Ratio">
	<color-contrast-option slot="body">
		<current-contrast-value
			>{colorContrastRangeValue}
			{colorContrastRangeValue === 4.5 ? ' Suggested' : ''}</current-contrast-value
		>

		<input
			type="range"
			min="0"
			max="21"
			on:change={() => saveContrastRatio()}
			step={$keyDown === 'Shift' ? 0.1 : 0.5}
			bind:value={colorContrastRangeValue}
		/>

		<InputShiftInfo />
	</color-contrast-option>
</OptionSection>

<style>
	input {
		width: 100%;
	}

	current-contrast-value {
		text-align: center;
		display: block;
	}
</style>
