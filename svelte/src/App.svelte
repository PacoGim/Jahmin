<script lang="ts">
	import Library from './components/Library.svelte'
	import Filter from './components/Filter.svelte'

	import { songIndex } from "./store/index.store";

	import { onMount } from 'svelte'

	const { ipcRenderer } = require('electron')

	onMount(() => {
		ipcRenderer.invoke('get-index', 'lol').then((result) => {
			// result = result.slice(0, 10)
			$songIndex = result
		})
	})
</script>

<main>
	<h1>Jahmin</h1>
	<!-- <Library/> -->
	<Filter/>
</main>

<style>
</style>
