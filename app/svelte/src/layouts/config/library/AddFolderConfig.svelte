<script lang="ts">
	import { directoriesConfig } from '../../../stores/config.store'
</script>

<add-folder-config>
	{#if $directoriesConfig}
		{#each $directoriesConfig.add || [] as directory, index (index)}
			{directory}
		{/each}
	{/if}
</add-folder-config>

<style>
</style>
