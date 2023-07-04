<script lang="ts">
	import { handleContextMenuEvent } from '../../services/contextMenu/!contextMenu.service'
	import { groupByConfig, groupByValuesConfig } from '../../stores/config.store'

	import updateConfigFn from '../../functions/updateConfig.fn'

	let groupedSongs = []

	$: groupSongs($groupByConfig)

	// $:console.log($groupByConfig , $groupByValuesConfig)

	function groupSongs(groupBy: string[]) {
		// For now, for the sake of finishing the app, multiple grouping is not going to be implemented, but the app will be ready for it later (Using an array of strings instead of just a string)
		window.ipc
			.bulkRead({
				queryData: {
					select: [`distinct ${groupBy[0]}`],
					order: [groupBy[0]]
				}
			})
			.then(response => {
				let result = response?.results?.data

				if (result.length > 0) {
					groupedSongs = result.map(item => item[groupBy[0]])
				}
			})
	}

	function setNewGroupValue(groupValue) {
		updateConfigFn({
			group: {
				groupByValues: [groupValue]
			}
		})
	}
</script>

<tag-group-svlt>
	{#each $groupByConfig || [] as group, index (index)}
		<group-svlt data-index={index}>
			<group-name
				on:click={e => handleContextMenuEvent(e)}
				on:keypress={e => handleContextMenuEvent(e)}
				tabindex="-1"
				role="button"
				data-name={group}
				data-index={index}
			>
				<button>
					{group}
				</button></group-name
			>

			<!-- {#if $selectedGroups[index]} -->
			{#each groupedSongs as groupValue}
				<group-value
					class={$groupByValuesConfig[index] === groupValue ? 'selected' : null}
					on:click={setNewGroupValue(groupValue)}
					on:keypress={setNewGroupValue(groupValue)}
					tabindex="-1"
					role="button"
				>
					{groupValue}
				</group-value>
			{/each}
			<!-- {/if} -->
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

		overflow-y: auto;

		color: var(--color-fg-1);

		/* overflow-y: hidden; */
	}

	group-svlt {
		height: 100%;
		/* display: flex; */
		overflow-y: auto;
		flex-direction: column;
		/* width: min-content; */
		border-right: 2px solid rgba(255, 255, 255, 0.05);

		width: 150px;
		/* border-right: 1px var(--color-bg-2) solid; */

		/* font-size: 0.85rem; */
	}

	group-svlt group-name {
		/* padding: 0.5rem 0.66rem; */
		padding: 0.5rem;
		padding-bottom: 0;

		/* background-color: var(--color-bg-2); */
		background-color: rgba(255, 255, 255, 0.05);
		font-size: 1rem;

		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;

		width: 100%;

		font-variation-settings: 'wght' calc(var(--default-weight) + 200);

		cursor: pointer;
	}

	group-svlt group-name button {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	group-value {
		display: block;
		font-size: 0.95rem;
		padding: 0.5rem 0.66rem;

		font-variation-settings: 'wght' calc(var(--default-weight));

		margin: 0.5rem 0.75rem;

		text-align: center;

		background-color: rgba(255, 255, 255, 0.05);
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

	/* group-value:first-of-type { */
	/* margin-top: 1rem; */
	/* } */

	group-value.selected {
		background-color: hsl(var(--art-hue), var(--art-saturation), 50%);
		color: hsl(var(--art-hue), var(--art-saturation), 90%);

		font-variation-settings: 'wght' calc(var(--default-weight) + 300);
	}

	group-value:hover {
		background-color: hsl(var(--art-hue), var(--art-saturation), 55%);
		color: hsl(var(--art-hue), var(--art-saturation), 95%);
	}
</style>
