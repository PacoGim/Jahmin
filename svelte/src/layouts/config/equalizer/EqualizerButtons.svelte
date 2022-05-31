<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'

	import generateId from '../../../functions/generateId.fn'
	import RefreshIcon from '../../../icons/RefreshIcon.svelte'
	import SaveIcon from '../../../icons/SaveIcon.svelte'
	import ToggleOffIcon from '../../../icons/ToggleOffIcon.svelte'
	import ToggleOnIcon from '../../../icons/ToggleOnIcon.svelte'
	import UpdateIcon from '../../../icons/UpdateIcon.svelte'

	import { addNewEqualizerProfileIPC, showEqualizerFolderIPC } from '../../../services/ipc.service'
	import notify from '../../../services/notify.service'
	import { equalizer, equalizerProfiles, isEqualizerDirty, isEqualizerOn, selectedEqId } from '../../../store/equalizer.store'
	import { equalizerService, promptService } from '../../../store/service.store'
	import type { EqualizerFileObjectType } from '../../../types/equalizerFileObject.type'

	function saveEqualizerAs(newName: string = '') {
		let promptState = {
			title: 'Enter Equalizer Name',
			placeholder: 'Equalizer name',
			confirmButtonText: 'Save As',
			cancelButtonText: 'Cancel',
			data: { id: generateId(), inputValue: newName }
		}

		$promptService.showPrompt(promptState).then(promptResult => {
			$promptService.closePrompt()

			let newEqualizerProfile: EqualizerFileObjectType = {
				id: promptResult.data.id,
				name: promptResult.data.result,
				values: []
			}

			for (let i in $equalizer) {
				newEqualizerProfile.values.push({ frequency: $equalizer[i].frequency.value, gain: $equalizer[i].gain.value })
			}

			addNewEqualizerProfileIPC(newEqualizerProfile).then(result => {
				if (result.code === 'EXISTS') {
					notify.error(`Name ${newEqualizerProfile.name} already exists.`)
					saveEqualizerAs(newEqualizerProfile.name)
				} else if (result.code === 'OK') {
					$equalizerProfiles.unshift(newEqualizerProfile)

					$equalizerProfiles = $equalizerProfiles
					$selectedEqId = newEqualizerProfile.id
				}
			})
		})
	}
</script>

<equalizer-buttons-config>
	<button class="toggleEqButton {$isEqualizerOn ? 'active' : 'not-active'}" on:click={() => $equalizerService.toggleEq()}>
		{#if $isEqualizerOn === true}
			<ToggleOnIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		{:else}
			<ToggleOffIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		{/if}

		Toggle EQ
	</button>
	<button
		class="resetEqButton"
		on:click={() => $equalizerService.resetEqualizer()}
		disabled={$isEqualizerDirty === false || $isEqualizerOn === false}
	>
		<RefreshIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		Reset
	</button>
	<button on:click={() => saveEqualizerAs()} disabled={$isEqualizerOn === false}>
		<SaveIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		Save as...
	</button>
	<button on:click={() => $equalizerService.updateEqualizer()} disabled={!$isEqualizerDirty}>
		<UpdateIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		Update
	</button>
</equalizer-buttons-config>

<style>
	equalizer-buttons-config {
		width: 100%;
		display: flex;
		margin: 0 auto;

		justify-content: center;

		margin-top: 2rem;
	}

	equalizer-buttons-config button {
		display: flex;
		align-items: center;
		margin: 0 0.25rem;
		transition: background-color 300ms linear;
	}

	equalizer-buttons-config button.toggleEqButton {
		margin-right: 4rem;
	}

	equalizer-buttons-config button.resetEqButton {
		margin-right: 4rem;
	}
</style>
