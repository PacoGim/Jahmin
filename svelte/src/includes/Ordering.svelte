<script>
import Order from "../components/Order.svelte";
import { valuesToGroup } from "../store/index.store";



</script>
<grouping-svlt>
	{#each $valuesToGroup as group, index (index)}
		<Order {index} {group}/>
	{/each}
</grouping-svlt>

<style>
	grouping-svlt {
		display: flex;
		height: 100%;
		width: 100%;
		grid-area: grouping-svlt;
		background-color: rgba(0,0,0,.25);
		flex-direction: row;
	}
</style>
