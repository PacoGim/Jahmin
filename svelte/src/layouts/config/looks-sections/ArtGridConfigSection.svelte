<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import isElementInViewportFn from '../../../functions/isElementInViewport.fn'
	import { compressAlbumArtIPC, saveConfig } from '../../../services/ipc.service'
	import { artSizeConfig, gridGapConfig } from '../../../store/config.store'
	import { albumListStore, layoutToShow, selectedOptionSection } from '../../../store/final.store'
	import { rangeInputService } from '../../../store/service.store'

	function setArtSize() {
		$layoutToShow = 'Home'

		$rangeInputService.showRangeInput({
			title: 'Art Size',
			min: 32,
			max: 512,
			step: 16,
			minStep: 1,
			value: Number($artSizeConfig),
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Close',
			onChange: value => {
				$artSizeConfig = value
			},
			onConfirm: newArtSize => {
				saveArtSize(newArtSize)
			},
			onCancel: previousArtSize => {
				saveArtSize(previousArtSize)
				$layoutToShow = 'Config'
			}
		})
	}

	function saveArtSize(newArtSize: number) {
		$artSizeConfig = newArtSize
		saveConfig({
			userOptions: {
				artSize: newArtSize
			}
		}).then(() => {
			document.querySelectorAll('art-grid-svlt > album > art-svlt').forEach((artElement: HTMLImageElement) => {
				if (isElementInViewportFn(artElement)) {
					compressAlbumArtIPC(artElement.dataset.albumId, newArtSize)
				} else {
					setTimeout(() => {
						compressAlbumArtIPC(artElement.dataset.albumId, newArtSize)
					}, 1000)
				}
			})
		})
	}

	function setGridGapSize() {
		$layoutToShow = 'Home'

		$rangeInputService.showRangeInput({
			title: 'Art Grid Gap',
			min: 0,
			max: 32,
			step: 2,
			minStep: 1,
			value: Number($gridGapConfig),
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Close',
			onChange: value => {
				$gridGapConfig = value
			},
			onConfirm: newGridGap => {
				saveConfig({
					userOptions: {
						gridGap: newGridGap
					}
				})
			},
			onCancel: previousGridGapValue => {
				$gridGapConfig = previousGridGapValue
				$layoutToShow = 'Config'
			}
		})
	}
</script>

<OptionSection title="Art Grid">
	<art-grid-size slot="body">
		<art-grid-option>
			<option-name>Art Size</option-name>
			<option-value>{$artSizeConfig}px</option-value>
			<button on:click={() => setArtSize()}>Edit Art Size</button>
		</art-grid-option>

		<art-grid-option>
			<option-name>Grid Gap</option-name>
			<option-value>{$gridGapConfig}px</option-value>
			<button on:click={() => setGridGapSize()}>Edit Grid Gap</button>
		</art-grid-option>
	</art-grid-size>
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
