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
	<config-edit-button>·.·</config-edit-button>
</font-size-config>