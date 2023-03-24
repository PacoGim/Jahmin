<script lang="ts">
	import UpdateIcon from '../../../icons/UpdateIcon.svelte'
	import { config } from '../../../stores/config.store'
	// import { fontSizeConfig } from '../../../stores/config.store'
	import { layoutToShow } from '../../../stores/main.store'
	import { rangeInputService } from '../../../stores/service.store'

	function setFontSize() {
		$layoutToShow = 'Library'

		$rangeInputService.showRangeInput({
			title: 'Font Size',
			min: 12,
			max: 18,
			step: 1,
			minStep: 0.25,
			value: Number($config.userOptions.fontSize),
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Close',
			onChange: value => {
				$config.userOptions.fontSize = value
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
		$config.userOptions.fontSize = newFontSize
		window.ipc.saveConfig({
			userOptions: {
				fontSize: newFontSize
			}
		})
	}
</script>

<font-size-config on:click={() => setFontSize()}> <config-edit-button>···</config-edit-button> </font-size-config>
