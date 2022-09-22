<script lang="ts">
	import { layoutToShow, reloadArts } from '../../../stores/main.store'

	function rebuildArtCache() {
		$reloadArts = Math.random()

		window.ipc.rebuildArtCache().then(() => {
			$layoutToShow = 'Library'
		})
	}
</script>

<font-size-config on:click={() => rebuildArtCache()}>
	<config-edit-button>Rebuild</config-edit-button>
</font-size-config>

<style>
	config-edit-button {
		font-size: 0.9rem;
		padding: 0 4px;
		font-variation-settings: 'wght' 600;
		width: max-content;
	}
</style>
