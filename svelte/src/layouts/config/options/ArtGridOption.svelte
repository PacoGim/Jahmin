<script lang="ts">
	import { onMount } from 'svelte'

	import OptionSection from '../../../components/OptionSection.svelte'
import { hash } from '../../../functions/hashString.fn';
	import { getArtIPC, saveConfig } from '../../../services/ipc.service'
	import { albumArtSizeConfig } from '../../../store/config.store'
	import { albumArtMapStore, albumListStore, layoutToShow } from '../../../store/final.store'
	import { rangeInputService } from '../../../store/service.store'
	import type { AlbumArtType } from '../../../types/albumArt.type'

	function setArtSize() {
		$layoutToShow = 'Main'

		$rangeInputService.showRangeInput({
			title: 'Art Size',
			min: 32,
			max: 512,
			step: 16,
			minStep: 1,
			value: Number($albumArtSizeConfig),
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Close',
			onChange: value => {
				$albumArtSizeConfig = value
			},
			onConfirm: newArtSize => {
				saveArtSize(newArtSize)
			},
			onCancel: newArtSize => {
				saveArtSize(newArtSize)
				$layoutToShow = 'Config'
			}
		})
	}

	function saveArtSize(newArtSize: number) {
		$albumArtSizeConfig = String(newArtSize)
		saveConfig({
			art: {
				dimension: newArtSize
			}
		}).then(() => {
			$albumListStore.forEach(album => {
				getArtIPC(album.RootDir).then((result: AlbumArtType) => {
					if (result?.isNew === false) {
						$albumArtMapStore = $albumArtMapStore.set(hash(album.RootDir), {
							version: Date.now(),
							filePath: result.filePath,
							fileType: result.fileType
						})


						// $albumArtMapStore = $albumArtMapStore
					}
				})
			})
		})
	}

	onMount(() => {
		setTimeout(() => {
			setArtSize()
		}, 500)
	})
</script>

<OptionSection title="Art Size">
	<art-grid-size slot="body">
		<p>Art Size : *Add art size here* <button on:click={() => setArtSize()}>Show Slider</button></p>
		<p>Art Grid Gap : *Add art size here* <button>Show Slider</button></p>
	</art-grid-size>
</OptionSection>

<style>
	art-grid-size {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
	}

	art-grid-size p {
		display: flex;
		justify-content: space-between;
	}
</style>
