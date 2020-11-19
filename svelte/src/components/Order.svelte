<script lang="ts">
	import { onMount } from 'svelte'
	import { getOrder } from '../service/ipc.service'

	export let index
	export let group
	let orderedSongs = undefined

	onMount(async () => {
		orderedSongs = await getOrder(index)
	})
</script>

{#if orderedSongs}
	<order>
		{#each orderedSongs as song, index (index)}
			<p>{song}</p>
		{/each}
	</order>
{/if}

<style>
</style>
