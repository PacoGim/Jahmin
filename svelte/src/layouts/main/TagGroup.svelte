<script lang="ts">
	import { onMount } from 'svelte'
	import { groupSongsIPC, saveConfig } from '../../services/ipc.service'
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
		for (let i = index; i < $groupByConfig.length; i++) {
			if (i === index) {
				$groupByValuesConfig[i] = groupValue
			} else {
				$groupByValuesConfig[i] = 'undefined'
			}
		}

		groupSongsIPC($groupByConfig, $groupByValuesConfig)
	}
</script>

<tag-group-svlt>
	{#each $groupByConfig as group, index (index)}
		<group-svlt data-index={index}>
			<group-name>{group}</group-name>

			{#if $selectedGroups[index]}
				<group-value
					class={$groupByValuesConfig[index] === 'undefined' ? 'selected' : null}
					on:click={() => setNewGroupValue(index, 'undefined')}
				>
					All ({$selectedGroups[index].length})
				</group-value>
				{#each $selectedGroups[index] as groupValue}
					<group-value
						class={$groupByValuesConfig[index] === groupValue ? 'selected' : null}
						on:click={() => setNewGroupValue(index, groupValue)}
					>
						{groupValue}
					</group-value>
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

		color: var(--color-fg-1);

		overflow-y: hidden;
	}

	group-svlt {
		height: 100%;
		display: flex;
		overflow-y: auto;
		flex-direction: column;
		width: min-content;
	}

	group-value {
		cursor: pointer;
		max-width: 200px;

		min-height: 1rem;

		text-overflow: ellipsis;

		overflow: hidden;
		white-space: nowrap;
	}

	group-value.selected::before {
		content: '•';
		margin-right: 0.5rem;
	}
</style>
