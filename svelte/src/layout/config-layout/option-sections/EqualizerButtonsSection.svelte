<script lang="ts">
	import generateId from '../../../functions/generateId.fn'

	import { addNewEqualizerProfileIPC, showEqualizerFolderIPC } from '../../../service/ipc.service'
	import notify from '../../../service/notify.service'
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

<equalizer-buttons-section>
	<button class={$isEqualizerOn ? 'active' : 'not-active'} on:click={() => $equalizerService.toggleEq()}>Toggle EQ</button>
	<button on:click={() => $equalizerService.resetEqualizer()} disabled={$isEqualizerDirty === false || $isEqualizerOn === false}
		>Reset</button
	>
	<button on:click={() => saveEqualizerAs()} disabled={$isEqualizerOn === false}>Save as...</button>
	<button on:click={() => $equalizerService.updateEqualizer()} disabled={!$isEqualizerDirty}>Update</button>
	<button on:click={() => showEqualizerFolderIPC()}>Show Folder</button>
</equalizer-buttons-section>

<style>
	equalizer-buttons-section button {
		color: #fff;
		background-color: var(--color-hl-1);

		transition: background-color 300ms linear;
	}
	equalizer-buttons-section button.not-active {
		background-color: var(--color-hl-2);
	}
	equalizer-buttons-section button:disabled {
		cursor: not-allowed;
		background-color: #6a7290;
	}
</style>
