<script lang="ts">
	import updateConfigFn from '../../../functions/updateConfig.fn'
	import { alwaysShowAlbumOverlayConfig } from '../../../stores/config.store'
	import traduceFn from '../../../functions/traduce.fn'
	import ToggleIcon from '../../../icons/ToggleIcon.svelte'
</script>

<always-show-album-overlay-config>
	<button
		on:click={() => {
			updateConfigFn({
				userOptions: {
					alwaysShowAlbumOverlay: !$alwaysShowAlbumOverlayConfig
				}
			})
		}}
	>
		{traduceFn('Alway show album overlay in Album Grid')}
		<ToggleIcon toggle={$alwaysShowAlbumOverlayConfig === true ? 'on' : 'off'} />
	</button>
</always-show-album-overlay-config>

<style>
	always-show-album-overlay-config {
		display: grid;
		align-content: center;
	}
</style>
