<script lang="ts">
	import { layoutToShow, reloadArts } from '../../../stores/main.store'

	function rebuildArtCache() {
		$reloadArts = Math.random()

		window.ipc.rebuildArtCache().then(() => {
			$layoutToShow = 'Library'
		})
	}
</script>

<font-size-config>
	<button on:click={() => rebuildArtCache()}>Rebuild Art Cache</button>
</font-size-config>

<style>
</style>
