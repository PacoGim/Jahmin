<script lang="ts">
	import isElementInViewportFn from '../../../functions/isElementInViewport.fn'
	import UpdateIcon from '../../../icons/UpdateIcon.svelte'
	import { compressAlbumArtIPC, saveConfig } from '../../../services/ipc.service'
	import { artSizeConfig } from '../../../store/config.store'
	import { layoutToShow } from '../../../store/final.store'
	import { rangeInputService } from '../../../store/service.store'

	function setGridSize() {
		$layoutToShow = 'Library'

		$rangeInputService.showRangeInput({
			title: 'Art Size',
			min: 64,
			max: 256,
			step: 8,
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
				artElement.dataset.artsize = String(newArtSize)
				if (isElementInViewportFn(artElement)) {
					compressAlbumArtIPC(artElement.dataset.rootdir, newArtSize, false)
				} else {
					setTimeout(() => {
						compressAlbumArtIPC(artElement.dataset.rootdir, newArtSize, false)
					}, 1000)
				}
			})
		})
	}
</script>

<grid-art-size-config>
	<button on:click={() => setGridSize()}
		>Change Art Size<UpdateIcon style="height: 1rem;margin-left: 0.5rem;fill:#fff;" />
	</button>
</grid-art-size-config>
