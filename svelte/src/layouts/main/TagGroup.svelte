<script lang="ts">
	import { handleContextMenuEvent } from '../../services/contextMenu.service'
import { groupSongs } from '../../services/groupSongs.service';
	import { groupByConfig, groupByValuesConfig } from '../../store/config.store'
	import { selectedGroupByValueStore, selectedGroups, triggerGroupingChangeEvent } from '../../store/final.store'

	let isFirstGroupSongs = true

	$:{
		console.log($selectedGroups)
	}

	$: {
		$groupByConfig
		if (isFirstGroupSongs === true) {
			isFirstGroupSongs = false
		} else {
			runSongGroup()
		}
	}

	$: {
		if ($triggerGroupingChangeEvent.length > 0) {
			$triggerGroupingChangeEvent.forEach((grouping, index) => {
				setNewGroupValue(index, grouping)
			})
			$triggerGroupingChangeEvent = []
		}
	}

	// TODO: Add Configuration for the amount of groups.

	function runSongGroup() {
		for (let i = 0; i < $groupByConfig.length; i++) {
			if ($selectedGroups[i] === undefined) {
				$selectedGroups[i] = []
			}
		}

		groupSongs($groupByConfig,$groupByValuesConfig)
		// groupSongsIPC($groupByConfig, $groupByValuesConfig)
	}

	function setNewGroupValue(index, groupValue) {
		for (let i = index; i < $groupByConfig.length; i++) {
			if (i === index) {
				$groupByValuesConfig[i] = groupValue
			} else {
				$groupByValuesConfig[i] = 'undefined'
			}
		}

		groupSongs($groupByConfig,$groupByValuesConfig)
		// groupSongsIPC($groupByConfig, $groupByValuesConfig)
	}
</script>

<tag-group-svlt>
	{#each $groupByConfig as group, index (index)}
		<group-svlt data-index={index}>
			<group-name on:click={e => handleContextMenuEvent(e)} data-name={group} data-index={index}>{group}</group-name>

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
		/* border-right: 1px var(--color-bg-2) solid; */

		font-size: 0.85rem;
	}

	group-svlt group-name {
		padding: 0.25rem 0.75rem;

		background-color: var(--color-bg-2);

		text-align: center;

		font-variation-settings: 'wght' calc(var(--default-weight) + 200);

		cursor: pointer;
	}

	group-value {
		display: flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		background-color: var(--color-bg-2);
		font-variation-settings: 'wght' calc(var(--default-weight));

		margin: 0.1rem 0.05rem;

		cursor: pointer;
		max-width: 200px;

		min-height: 2rem;

		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	group-value.selected {
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}
	group-value.selected::before {
		content: '•';
		position: absolute;

		transform: translateX(-8px);
	}
</style>
