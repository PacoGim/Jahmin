<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import { getArtIPC, saveConfig } from '../../../services/ipc.service'
	import { fontSizeConfig } from '../../../store/config.store'
	import { layoutToShow } from '../../../store/final.store'
	import { rangeInputService } from '../../../store/service.store'

	function setFontSize() {
		$layoutToShow = 'Home'

		$rangeInputService.showRangeInput({
			title: 'Font Size',
			min: 12,
			max: 18,
			step: 1,
			minStep: 0.25,
			value: Number($fontSizeConfig),
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Close',
			onChange: value => {
				$fontSizeConfig = value
			},
			onConfirm: newFontSize => {
				saveFontSize(newFontSize)
			},
			onCancel: previousFontSize => {
				saveFontSize(previousFontSize)
				$layoutToShow = 'Config'
			}
		})
	}

	function saveFontSize(newFontSize) {
		$fontSizeConfig = newFontSize
		saveConfig({
			userOptions: {
				fontSize: newFontSize
			}
		})
	}
</script>

<OptionSection title="Font Size">
	<font-size-config slot="body">
		<button on:click={() => setFontSize()}>Set new size</button>
	</font-size-config>
</OptionSection>

<style>
	art-grid-size {
		text-align: center;
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
	}

	art-grid-option {
		display: flex;
		flex-direction: column;

		border: 1px solid var(--color-fg-1);
		padding: 1rem;

		border-radius: 4px;
	}

	art-grid-option option-name {
		font-size: 1rem;
		margin-bottom: 1rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}

	art-grid-option option-value {
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}
</style>
