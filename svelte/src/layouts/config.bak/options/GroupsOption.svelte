<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'
	import { handleContextMenuEvent } from '../../../services/contextMenu.service'
	import { saveConfig } from '../../../services/ipc.service'
	import notifyService from '../../../services/notify.service'
	import { groupByConfig, groupByValuesConfig } from '../../../store/config.store'

	function addGroup() {
		if ($groupByConfig.length >= 5) {
			notifyService.error('You can have 5 groupings maximum.')
		} else {
			$groupByConfig.push('Genre')
			$groupByConfig = $groupByConfig

			saveGroupToConfig()
		}
	}

	function deleteGroup(index: number) {
		if ($groupByConfig.length <= 1) {
			notifyService.error('You need 1 group minimum.')
		} else {
			$groupByConfig.splice(index, 1)
			$groupByValuesConfig.splice(index, 1)
			$groupByConfig = $groupByConfig
			$groupByValuesConfig = $groupByValuesConfig

			saveGroupToConfig()
		}
	}

	function saveGroupToConfig() {
		saveConfig({
			group: {
				groupBy: $groupByConfig,
				groupByValues: $groupByValuesConfig
			}
		})
	}
</script>

<OptionSection title="Group Amount">
	<group-amount-section slot="body">
		{#each $groupByConfig as group, index (index)}
			<group-container>
				<group-delete on:click={() => deleteGroup(index)}>
					<DeleteIcon style="height: 1rem;fill: var(--color-fg-1) ;" />
				</group-delete>
				<group-name on:click={e => handleContextMenuEvent(e)} data-name={group} data-index={index}>{group}</group-name>
			</group-container>
		{/each}
		<button on:click={() => addGroup()}>Add Group</button>
	</group-amount-section>
</OptionSection>

<style>
	group-amount-section {
		display: flex;
	}

	group-container {
		display: flex;
		align-items: center;
	}

	group-delete {
		cursor: pointer;
		display: flex;
		align-items: center;
	}
</style>
