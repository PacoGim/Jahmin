<script>
	import Order from '../components/Order.svelte'
	import { storeConfig, valuesToGroup } from '../store/index.store'

	let doRenderOrder = false

	$: {
		let groupOnlyByFolder = $storeConfig?.userOptions?.groupOnlyByFolder
		if (groupOnlyByFolder !== undefined) {
			doRenderOrder = !groupOnlyByFolder
		}
	}
</script>

{#if doRenderOrder}
	<grouping-svlt>
		{#each $valuesToGroup as group, index (index)}
			<Order {index} {group} />
		{/each}
	</grouping-svlt>
{/if}

<style>
	grouping-svlt {
		display: flex;
		height: 100%;
		width: 100%;
		grid-area: grouping-svlt;
		background-color: rgba(0, 0, 0, 0.25);
		flex-direction: row;
	}
</style>
