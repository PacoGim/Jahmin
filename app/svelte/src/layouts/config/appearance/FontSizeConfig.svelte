<script lang="ts">
	import UpdateIcon from '../../../icons/UpdateIcon.svelte'
	// import { fontSizeConfig } from '../../../stores/config.store'
	import { config, layoutToShow } from '../../../stores/main.store'
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

<font-size-config>
	<button on:click={() => setFontSize()}
		>Change Font Size <UpdateIcon style="height: 1rem;margin-left: 0.5rem;fill:#fff;" />
	</button>
</font-size-config>

<style>
</style>
