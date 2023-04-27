<script lang="ts">
	import generateId from '../../../functions/generateId.fn'
	import validateFileNameFn from '../../../functions/validateFileName.fn'
	import RefreshIcon from '../../../icons/RefreshIcon.svelte'
	import SaveIcon from '../../../icons/SaveIcon.svelte'
	import ToggleOffIcon from '../../../icons/ToggleOffIcon.svelte'
	import ToggleOnIcon from '../../../icons/ToggleOnIcon.svelte'
	import UpdateIcon from '../../../icons/UpdateIcon.svelte'

	import notify from '../../../services/notify.service'
	import {
		currentEqProfile,
		equalizer,
		equalizerProfiles,
		isEqualizerDirty,
		isEqualizerOn,
		selectedEqName
	} from '../../../stores/equalizer.store'
	import { promptService } from '../../../stores/service.store'
	import type { EqualizerProfileType } from '../../../../../types/equalizerProfile.type'
	import type { PromptStateType } from '../../../../../types/promptState.type'
	import equalizerService from '../../../services/equalizer/!equalizer.service'

	function saveEqualizerAs(newName: string = '') {
		let promptState: PromptStateType = {
			title: 'Enter Equalizer Name',
			placeholder: 'Equalizer name',
			confirmButtonText: 'Save As',
			cancelButtonText: 'Cancel',
			validateFn: validateFileNameFn,
			data: { id: generateId(), inputValue: newName }
		}

		$promptService.showPrompt(promptState).then(promptResult => {
			$promptService.closePrompt()

			let newEqualizerProfile: EqualizerProfileType = {
				name: promptResult.data.result,
				values: {}
			}

			for (let i in $equalizer) {
				newEqualizerProfile.values[$equalizer[i].frequency.value] = $equalizer[i].gain.value
				// newEqualizerProfile.values.push({ frequency: $equalizer[i].frequency.value, gain: $equalizer[i].gain.value })
			}

			window.ipc.addNewEqualizerProfile(newEqualizerProfile).then(result => {
				if (result.code === 'EXISTS') {
					notify.error(`Name ${newEqualizerProfile.name} already exists.`)
					saveEqualizerAs(newEqualizerProfile.name)
				} else if (result.code === 'OK') {
					$equalizerProfiles.unshift(newEqualizerProfile)

					$equalizerProfiles = $equalizerProfiles
					$selectedEqName = newEqualizerProfile.name
				}
			})
		})
	}
</script>

<equalizer-buttons-config>
	<button
		class="toggleEqButton {$isEqualizerOn ? 'active' : 'not-active'}"
		on:click={() => equalizerService.toggleEqualizerFn()}
	>
		{#if $isEqualizerOn === true}
			<ToggleOnIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		{:else}
			<ToggleOffIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		{/if}

		Toggle EQ
	</button>
	<button
		class="resetEqButton"
		on:click={() => equalizerService.resetEqualizerFn()}
		disabled={$isEqualizerDirty === false || $isEqualizerOn === false}
	>
		<RefreshIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		Reset
	</button>
	<button on:click={() => saveEqualizerAs()} disabled={$isEqualizerOn === false}>
		<SaveIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" />
		Save as...
	</button>
	<button
		on:click={() => equalizerService.updateEqualizerFn()}
		disabled={!$isEqualizerDirty || $currentEqProfile.type === 'Community'}
	>
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
		/* transition: background-color 300ms linear; */
	}

	equalizer-buttons-config button.toggleEqButton {
		margin-right: 4rem;
	}

	equalizer-buttons-config button.resetEqButton {
		margin-right: 4rem;
	}

	button.not-active {
		background-color: var(--color-dangerRed);
	}
</style>
