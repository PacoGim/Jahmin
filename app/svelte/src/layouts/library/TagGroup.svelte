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
		/* border-right: 1px hsl(var(--art-hue), var(--art-saturation), 50%) solid; */

		/* background-color: hsl(var(--art-hue), var(--art-saturation), 20%); */
		/* color: hsl(var(--art-hue), var(--art-saturation), 80%); */

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
		/* width: min-content; */
		border-right: 2px solid white;
		width: 150px;
		/* border-right: 1px var(--color-bg-2) solid; */

		/* font-size: 0.85rem; */
	}

	group-svlt group-name {
		padding: 0.5rem 0.66rem;

		/* background-color: var(--color-bg-2); */
		background-color: rgba(255, 255, 255, 0.05);
		font-size: 1rem;

		text-align: center;

		font-variation-settings: 'wght' calc(var(--default-weight) + 200);

		cursor: pointer;
	}

	group-value {
		display: block;
		font-size: 0.95rem;
		padding: 0.5rem 0.66rem;

		font-variation-settings: 'wght' calc(var(--default-weight));

		margin: 0.5rem 0.75rem;

		text-align: center;

		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 2.5px;

		cursor: pointer;
		max-width: 150px;

		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;

		transition-property: background-color, color, font-variation-settings;
		transition-duration: 200ms;
		transition-timing-function: linear;
	}

	group-value:first-of-type {
		margin-top: 1rem;
	}

	group-value.selected {
		background-color: hsl(var(--art-hue), var(--art-saturation), 50%);
		color: hsl(var(--art-hue), var(--art-saturation), 80%);
		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
	}

	group-value:hover {
		background-color: hsl(var(--art-hue), var(--art-saturation), 50%);
		color: hsl(var(--art-hue), var(--art-saturation), 80%);
	}
</style>
