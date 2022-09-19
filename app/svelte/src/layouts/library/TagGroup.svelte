<script lang="ts">
	import { handleContextMenuEvent } from '../../services/contextMenu.service'
	import { groupSongs } from '../../services/groupSongs.service'

	import { config, dbVersionStore, selectedGroups, triggerGroupingChangeEvent } from '../../stores/main.store'

	let isFirstGroupSongs = true

	$: {
		if ($dbVersionStore) {
			runSongGroup()
		}
	}

	$: {
		$config.group.groupBy
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
		for (let i = 0; i < $config.group.groupBy.length; i++) {
			if ($selectedGroups[i] === undefined) {
				$selectedGroups[i] = []
			}
		}

		groupSongs($config.group.groupBy, $config.group.groupByValues)
	}

	function setNewGroupValue(index, groupValue) {
		for (let i = index; i < $config.group.groupBy.length; i++) {
			if (i === index) {
				$config.group.groupByValues[i] = groupValue
			} else {
				$config.group.groupByValues[i] = 'undefined'
			}
		}

		groupSongs($config.group.groupBy, $config.group.groupByValues)
	}
</script>

<tag-group-svlt>
	{#each $config.group.groupBy || [] as group, index (index)}
		<group-svlt data-index={index}>
			<group-name on:click={e => handleContextMenuEvent(e)} data-name={group} data-index={index}>{group}</group-name>

			{#if $selectedGroups[index]}
				<group-value
					class={$config.group.groupByValues[index] === 'undefined' ? 'selected' : null}
					on:click={() => setNewGroupValue(index, 'undefined')}
				>
					All ({$selectedGroups[index].length})
				</group-value>
				{#each $selectedGroups[index] as groupValue}
					<group-value
						class={$config.group.groupByValues[index] === groupValue ? 'selected' : null}
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

		/* overflow-y: hidden; */
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

		/* background-color: var(--color-bg-2); */
		background-color: rgba(255, 255, 255, 0.05);
		font-size: 0.95rem;

		text-align: center;

		font-variation-settings: 'wght' calc(var(--default-weight) + 200);

		cursor: pointer;
	}

	group-value {
		display: flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		/* background-color: var(--color-bg-2); */
		/* background-color: rgba(255, 255, 255, 0.025); */
		/* border-bottom: 1px rgba(255, 255, 255, 0.05) solid; */
		box-shadow: inset 0 -1px 0 0 rgba(255, 255, 255, 0.05);

		font-variation-settings: 'wght' calc(var(--default-weight));

		/* margin: 0.1rem 0.05rem; */

		cursor: pointer;
		max-width: 200px;

		min-height: 2rem;

		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;

		transition: background-color 200ms linear;
	}

	group-value.selected {
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}
	group-value.selected::before {
		content: '•';
		position: absolute;

		transform: translateX(-8px);
	}

	group-value:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}
</style>
