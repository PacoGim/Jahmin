<script lang="ts">
	import generateId from '../../../functions/generateId.fn'
	import updateConfigFn from '../../../functions/updateConfig.fn'
	import { config, layoutToShow } from '../../../stores/main.store'

	let id = generateId()

	function onOptionChange(evt) {
		updateConfigFn({
			userOptions: {
				alwaysShowAlbumOverlay: evt.target.checked
			}
		})

		$layoutToShow = 'Library'
	}
</script>

<always-show-album-overlay-config>
	<label for={id}>Alway show album overlay in Album Grid</label>
	<input type="checkbox" name={id} {id} on:change={onOptionChange} bind:checked={$config.userOptions.alwaysShowAlbumOverlay} />
</always-show-album-overlay-config>

<style>
	always-show-album-overlay-config {
    display: flex;
    align-content: center;
	}

  always-show-album-overlay-config input{
    margin-left: 5px;
  }
</style>
