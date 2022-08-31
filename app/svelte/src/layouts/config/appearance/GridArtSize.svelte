<script lang="ts">
	import isElementInViewportFn from '../../../functions/isElementInViewport.fn'
	import UpdateIcon from '../../../icons/UpdateIcon.svelte'
	// import { artSizeConfig } from '../../../stores/config.store'
	import { config, layoutToShow } from '../../../stores/main.store'
	import { rangeInputService } from '../../../stores/service.store'

	function setGridSize() {
		$layoutToShow = 'Library'

		$rangeInputService.showRangeInput({
			title: 'Art Size',
			min: 64,
			max: 256,
			step: 8,
			minStep: 1,
			value: Number($config.userOptions.artSize),
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Close',
			onChange: value => {
				$config.userOptions.artSize = value
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
		$config.userOptions.artSize = newArtSize
		window.ipc
			.saveConfig({
				userOptions: {
					artSize: newArtSize
				}
			})
			.then(() => {
				document.querySelectorAll('art-grid-svlt > album > art-svlt').forEach((artElement: HTMLImageElement) => {
					artElement.dataset.artsize = String(newArtSize)
					if (isElementInViewportFn(artElement)) {
						window.ipc.compressAlbumArt(artElement.dataset.rootdir, newArtSize, false)
					} else {
						setTimeout(() => {
							window.ipc.compressAlbumArt(artElement.dataset.rootdir, newArtSize, false)
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
