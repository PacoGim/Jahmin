<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import UpdateIcon from '../../../icons/UpdateIcon.svelte'
	import { saveConfig } from '../../../services/ipc.service'
	import { fontSizeConfig } from '../../../store/config.store'
	import { layoutToShow } from '../../../store/final.store'
	import { rangeInputService } from '../../../store/service.store'

	function setFontSize() {
		$layoutToShow = 'Library'

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

<font-size-config>
	<button on:click={() => setFontSize()}
		>Change Font Size <UpdateIcon style="height: 1rem;margin-left: 0.5rem;fill:#fff;" />
	</button>
</font-size-config>

<style>
</style>
