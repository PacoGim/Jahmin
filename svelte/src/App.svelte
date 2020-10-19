<script lang="ts">
	import Library from './includes/Library.svelte'
	import Filter from './includes/Filtering.svelte'

	import { songIndex } from './store/index.store'

	import { onMount } from 'svelte'

	const { ipcRenderer,shell } = require('electron')

	onMount(() => {
		ipcRenderer.invoke('get-index', 'lol').then((result) => {
			// result = result.slice(0, 10)
			// console.log(result)
			$songIndex = result
		})
	})
</script>

<main>
	<h1>Jahmin</h1>
	<!-- <Library/> -->

	{#if $songIndex.length>0}
	<Filter/>
	{/if}
</main>

<style>
</style>
