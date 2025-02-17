<script lang="ts">
	import handleComponentsEventsFn from '../../functions/handleComponentsEvents.fn'
	import updateConfigFn from '../../functions/updateConfig.fn'
	import { handleContextMenuEvent } from '../../services/contextMenu/!contextMenu.service'
	import { tagGroupEvents } from '../../stores/componentsEvents.store'
	import { groupByConfig, groupByValueConfig } from '../../stores/config.store'

	import { dbVersionStore, userSearch } from '../../stores/main.store'
	import { afterUpdate } from 'svelte'

	let groupedSongs = []
	let stopAfterUpdate = false

	$: groupSongs($groupByConfig, $userSearch)
	$: $dbVersionStore !== 0 ? groupSongs($groupByConfig, $userSearch) : null

	$: handleComponentsEventsFn($tagGroupEvents)

	function groupSongs(groupBy: string, userSearch: string) {
		if (groupBy === 'Year') {
			groupBy = 'DateYear'
		}

		// For now, for the sake of finishing the app, multiple grouping is not going to be implemented, but the app will be ready for it later (Using an array of strings instead of just a string)
		window.ipc
			.bulkRead({
				queryData: {
					select: [`distinct ${groupBy}`],
					order: [groupBy],
					search: userSearch
				}
			})
			.then(response => {
				let result = response?.results?.data

				if (result.length > 0) {
					groupedSongs = result.map(item => item[groupBy])
				}
			})
	}

	function setNewGroupValue(groupValue) {
		updateConfigFn({
			group: {
				groupByValue: groupValue
			}
		})
	}

	// After each update cycle
	afterUpdate(() => {
		handleComponentsEventsFn($tagGroupEvents)

		// console.log($tagGroupEvents)

		/* 		if (stopAfterUpdate === false) {
			// Gets the group element.
			let groupElement: HTMLElement = document.querySelector(`#group-${$groupByValueConfig}`)
			// If the group element doesn't exist yet.
			if (groupElement !== null) {
				stopAfterUpdate = true
				// The element exists, then it scrolls smoothly to it.
				groupElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
			}
		} */
	})
</script>

<tag-group-svlt>
	<group-svlt>
		<group-name
			on:click={e => handleContextMenuEvent(e)}
			on:keypress={e => handleContextMenuEvent(e)}
			tabindex="-1"
			role="button"
		>
			<button>
				{$groupByConfig}
			</button></group-name
		>

		{#each groupedSongs as groupValue, index (index)}
			<group-value
				class={$groupByValueConfig === groupValue ? 'selected' : null}
				id="group-{groupValue}"
				on:click={setNewGroupValue(groupValue)}
				on:keypress={setNewGroupValue(groupValue)}
				tabindex="-1"
				role="button"
			>
				{groupValue}
			</group-value>
		{/each}
	</group-svlt>
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
		/* border-right: 2px solid rgba(255, 255, 255, 0.05); */

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
