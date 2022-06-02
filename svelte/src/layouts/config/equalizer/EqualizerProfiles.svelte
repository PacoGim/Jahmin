<script lang="ts">
	import OptionSection from '../../../components/OptionSection.svelte'

	import generateId from '../../../functions/generateId.fn'
	import AddIcon from '../../../icons/AddIcon.svelte'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'

	import EditIcon from '../../../icons/EditIcon.svelte'
	import { addNewEqualizerProfileIPC, deleteEqualizerIPC, renameEqualizerIPC } from '../../../services/ipc.service'
	import notify from '../../../services/notify.service'

	import { equalizer, equalizerProfiles, selectedEqId } from '../../../store/equalizer.store'
	import { confirmService, equalizerService, promptService } from '../../../store/service.store'
	import type { EqualizerFileObjectType } from '../../../types/equalizerFileObject.type'

	function renameEq(eqId: string, name: string) {
		if (eqId === 'Default') {
			return notify.error("Default profile can't be renamed.")
		}

		let promptState = {
			title: 'Rename Equalizer Preset',
			placeholder: 'Equalizer new name',
			confirmButtonText: 'Rename',
			cancelButtonText: 'Cancel',
			data: { eqId, inputValue: name }
		}

		$promptService.showPrompt(promptState).then(promptResult => {
			let newName = promptResult.data.result

			renameEqualizerIPC(eqId, newName).then(result => {
				$promptService.closePrompt()

				if (result.code === 'OK') {
					let equalizerFound = $equalizerProfiles.find(x => x.id === eqId)

					if (equalizerFound) {
						equalizerFound.name = newName
						$equalizerProfiles = $equalizerProfiles
					}

					notify.success(`Equalizer renamed to "${newName}"`)
				} else if (result.code === 'EXISTS') {
					notify.error(`Name ${newName} already exists.`)

					// Reruns the fn to reopen the prompt.
					renameEq(eqId, name)
				}
			})
		})
	}

	function deleteEq(eqId: string, name: string) {
		if (eqId === 'Default') {
			return notify.error("Default profile can't be deleted")
		}

		let confirmState = {
			textToConfirm: `Delete equalizer "${name}"?`,
			title: 'Delete Equalizer',
			data: {
				id: eqId
			}
		}

		$confirmService.showConfirm(confirmState).then(result => {
			$confirmService.closeConfirm()

			let equalizerId = result.id

			if (equalizerId) {
				deleteEqualizerIPC(equalizerId).then(result => {
					if (result.code === 'OK') {
						let indexToDelete = $equalizerProfiles.findIndex(x => x.id === equalizerId)

						$equalizerProfiles.splice(indexToDelete, 1)

						$equalizerProfiles = $equalizerProfiles

						if ($selectedEqId === equalizerId) {
							$selectedEqId = 'Default'
						}

						notify.success('Equalizer successfully deleted.')
					}
				})
			}
		})
	}

	function addNewProfile(newName: string = '') {
		let promptState = {
			title: 'New Profile Name',
			placeholder: 'Enter new profile name',
			confirmButtonText: 'Confirm',
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
				newEqualizerProfile.values.push({ frequency: $equalizer[i].frequency.value, gain: 0 })
			}

			addNewEqualizerProfileIPC(newEqualizerProfile).then(result => {
				if (result.code === 'EXISTS') {
					notify.error(`Name ${newEqualizerProfile.name} already exists.`)
					addNewProfile(newEqualizerProfile.name)
				} else if (result.code === 'OK') {
					$equalizerProfiles.unshift(newEqualizerProfile)

					$equalizerProfiles = $equalizerProfiles
					$selectedEqId = newEqualizerProfile.id
				}
			})
		})
	}
</script>

<equalizer-profiles-config>
	<equalizer-profiles>
		{#each $equalizerProfiles as eq (eq.id)}
			<equalizer-field id="eq-{eq.id}">
				<equalizer-name on:click={() => $equalizerService.changeProfile(eq.id)}
					>{$selectedEqId === eq.id ? '‣ ' : ''} {eq.name}</equalizer-name
				>
				<equalizer-rename class="eqProfileButton" on:click={() => renameEq(eq.id, eq.name)}>
					<EditIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
					Rename
				</equalizer-rename>
				<equalizer-delete class="eqProfileButton" on:click={() => deleteEq(eq.id, eq.name)}>
					<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
					Delete
				</equalizer-delete>
			</equalizer-field>
		{/each}
	</equalizer-profiles>
	<button class="addProfile" on:click={() => addNewProfile()}
		><AddIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" /> Add new profile</button
	>
</equalizer-profiles-config>

<style>
	equalizer-profiles {
		width: var(--clamp-width);
		max-height: 10rem;
		min-height: 10rem;
		display: block;
		overflow-y: auto;
		margin: 0 auto;
		margin-top: 1rem;
	}
	equalizer-profiles equalizer-field {
		cursor: pointer;
		display: grid;
		grid-template-columns: auto max-content max-content;
		transition: background-color 150ms ease-in-out;
	}

	equalizer-profiles equalizer-field * {
		transition: background-color 150ms ease-in-out;
	}

	equalizer-profiles equalizer-field *.eqProfileButton {
		display: flex;
		padding: 0.25rem 0.5rem;
		height: inherit;
		margin-right: 1rem;

		font-size: 0.85rem;
		font-variation-settings: 'wght' 450;
	}

	equalizer-profiles equalizer-field:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	equalizer-profiles equalizer-field equalizer-name {
		padding: 0.25rem 0.5rem;
	}

	equalizer-profiles equalizer-field equalizer-rename:hover {
		background-color: var(--color-hl-blue);
	}

	equalizer-profiles equalizer-field equalizer-delete:hover {
		background-color: var(--color-hl-2);
	}

	button.addProfile {
		display: flex;
		align-items: center;
		max-width: fit-content;
		margin: 1rem auto 0 auto;
	}
</style>
