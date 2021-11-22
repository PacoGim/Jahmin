<script lang="ts">
	import { onMount } from 'svelte'
	import { groupSongsIPC } from '../../services/ipc.service'
	import { groupByConfig, groupByValuesConfig } from '../../store/config.store'
	import { selectedGroups } from '../../store/final.store'

	let isFirstGroupSongs = true
	$: {
		$groupByConfig
		if (isFirstGroupSongs === true) {
			isFirstGroupSongs = false
		} else {
			runSongGroup()
		}
	}

	// TODO: Add Configuration for the amount of groups.

	function runSongGroup() {
		for (let i = 0; i < $groupByConfig.length; i++) {
			if ($selectedGroups[i] === undefined) {
				$selectedGroups[i] = []
			}
		}

		groupSongsIPC($groupByConfig, $groupByValuesConfig)
	}

	function setNewGroupValue(index, groupValue) {
		$groupByValuesConfig[index] = groupValue
		groupSongsIPC($groupByConfig, $groupByValuesConfig)
	}
</script>

<tag-group-svlt>
	{#each $groupByConfig as group, index (index)}
		<group-svlt data-index={index}>
			<group-name>{group}</group-name>

			{#if $selectedGroups[index]}
				{#each $selectedGroups[index] as groupValue}
					<p on:click={() => setNewGroupValue(index, groupValue)}>{groupValue}</p>
				{/each}
			{/if}
		</group-svlt>
	{/each}
</tag-group-svlt>

<style>
	tag-group-svlt {
		grid-area: tag-group-svlt;

		display: flex;
		flex-direction: row;

		height: 100%;

		color: var(--color-fg-1);
	}

	group-svlt {
		margin-right: 1rem;
	}
</style>
