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
				updateArtSize(value)
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

	function updateArtSize(newArtSize) {
		$config.userOptions.artSize = newArtSize

		document.querySelectorAll('art-grid-svlt album art-svlt').forEach((element: HTMLElement) => {
			element.style.height = `${newArtSize}px`
			element.style.width = `${newArtSize}px`
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
					let parentAlbumElementRootDir = artElement.closest('album').getAttribute('rootDir')

					if (isElementInViewportFn(artElement)) {
						window.ipc.handleArt(parentAlbumElementRootDir, artElement.getAttribute('id'), newArtSize)
					} else {
						setTimeout(() => {
							window.ipc.handleArt(parentAlbumElementRootDir, artElement.getAttribute('id'), newArtSize)
						}, 1000)
					}
				})
			})
	}
</script>

<grid-art-size-config on:click={() => setGridSize()}>
	<config-edit-button>···</config-edit-button>
</grid-art-size-config>
