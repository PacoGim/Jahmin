<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import { onMount } from 'svelte'
	import { layoutToShow, reloadArts } from '../../../stores/main.store'
	import traduceFn from '../../../functions/traduce.fn'

	let artCacheSize = ''

	function rebuildArtCache() {
		$reloadArts = Math.random()

		window.ipc.rebuildArtCache().then(() => {
			$layoutToShow = 'Library'
		})
	}

	onMount(() => {
		window.ipc.getArtCacheSize().then(size => {
			artCacheSize = ` (${size}) `
		})
	})
</script>

<font-size-config on:click={() => rebuildArtCache()}>
	<config-edit-button class="smooth-colors">{traduceFn('Clean')}{artCacheSize}</config-edit-button>
</font-size-config>

<style>
	config-edit-button {
		font-size: 0.9rem;
		padding: 0 4px;
		font-variation-settings: 'wght' 600;
		width: max-content;
	}
</style>
