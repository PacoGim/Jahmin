<script lang="ts">
  import updateConfigFn from '../../../functions/updateConfig.fn'
	import { configStore } from '../../../stores/config.store'
	import { layoutToShow } from '../../../stores/main.store'
	import { rangeInputService } from '../../../stores/service.store'

	function setGridGap() {
		$layoutToShow = 'Library'

		$rangeInputService.showRangeInput({
			title: 'Grid Gap',
			min: 0,
			max: 64,
			step: 2,
			minStep: 1,
			value: Number($configStore.userOptions.gridGap),
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Close',
			onChange: value => {
				updateGridGapSize(value)
			},
			onConfirm: newGridGap => {
				saveGridGapSize(newGridGap)
			},
			onCancel: previousGridGap => {
				saveGridGapSize(previousGridGap)
				$layoutToShow = 'Config'
			}
		})
	}

	function updateGridGapSize(newGridGap: number) {
		$configStore.userOptions.gridGap = newGridGap
	}

	function saveGridGapSize(newGridGap: number) {
		updateConfigFn({
			userOptions: {
				gridGap: newGridGap
			}
		})
	}
</script>

<grid-art-size-config on:click={() => setGridGap()} on:keypress={() => setGridGap()} tabindex="-1" role="button">
	<config-edit-button class="smooth-colors">···</config-edit-button>
</grid-art-size-config>
