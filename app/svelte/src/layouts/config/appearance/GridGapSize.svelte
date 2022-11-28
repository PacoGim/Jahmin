<script lang="ts">
	import { config, layoutToShow } from '../../../stores/main.store'
	import { rangeInputService } from '../../../stores/service.store'

	function setGridGap() {
		$layoutToShow = 'Library'

		$rangeInputService.showRangeInput({
			title: 'Grid Gap',
			min: 0,
			max: 64,
			step: 2,
			minStep: 1,
			value: Number($config.userOptions.gridGap),
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Close',
			onChange: value => {
				updateArtSize(value)
			},
			onConfirm: newGridGap => {
				saveArtSize(newGridGap)
			},
			onCancel: previousGridGap => {
				saveArtSize(previousGridGap)
				$layoutToShow = 'Config'
			}
		})
	}

	function updateArtSize(newGridGap: number) {
		$config.userOptions.gridGap = newGridGap
	}

	function saveArtSize(newGridGap: number) {
		$config.userOptions.gridGap = newGridGap
		window.ipc.saveConfig({
			userOptions: {
				gridGap: newGridGap
			}
		})
	}
</script>

<grid-art-size-config on:click={() => setGridGap()}>
	<config-edit-button>···</config-edit-button>
</grid-art-size-config>
