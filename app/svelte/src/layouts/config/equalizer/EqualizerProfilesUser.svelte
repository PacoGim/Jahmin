<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import type { EqualizerProfileType } from '../../../../../types/equalizerProfile.type'
	import type { PromptStateType } from '../../../../../types/promptState.type'
	import generateId from '../../../functions/generateId.fn'
	import validateFileNameFn from '../../../functions/validateFileName.fn'
	import AddIcon from '../../../icons/AddIcon.svelte'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'
	import EditIcon from '../../../icons/EditIcon.svelte'
	import notifyService from '../../../services/notify.service'
	import {
		currentEqHash,
		equalizer,
		equalizerNameStore,
		equalizerProfiles,
		selectedEqName
	} from '../../../stores/equalizer.store'
	import { confirmService, equalizerService, promptService } from '../../../stores/service.store'

	import equalizerServiceNew from '../../../services/equalizer/!equalizer.service'

	function renameEq(eqName: string) {
		if (eqName === 'Default') {
			return notifyService.error("Default profile can't be renamed.")
		}

		let promptState: PromptStateType = {
			title: 'Rename Equalizer Preset',
			placeholder: 'Equalizer new name',
			confirmButtonText: 'Rename',
			cancelButtonText: 'Cancel',
			validateFn: validateFileNameFn,
			data: { eqName, inputValue: eqName }
		}

		$promptService.showPrompt(promptState).then(promptResult => {
			let newName = promptResult.data.result

			window.ipc.renameEqualizer(eqName, newName).then(result => {
				$promptService.closePrompt()

				if (result.code === 'OK') {
					let equalizerFound = $equalizerProfiles.find(x => x.name === eqName)

					if (equalizerFound) {
						equalizerFound.name = newName
						$equalizerProfiles = $equalizerProfiles
					}

					notifyService.success(`Equalizer renamed to "${newName}"`)
				} else if (result.code === 'EXISTS') {
					notifyService.error(`Name ${newName} already exists.`)

					// Reruns the fn to reopen the prompt.
					renameEq(eqName)
				}
			})
		})
	}

	function deleteEq(eqName: string) {
		if (eqName === 'Default') {
			return notifyService.error("Default profile can't be deleted")
		}

		let confirmState = {
			textToConfirm: `Delete equalizer "${eqName}"?`,
			title: 'Delete Equalizer',
			data: {
				name: eqName
			}
		}

		$confirmService.showConfirm(confirmState).then(result => {
			$confirmService.closeConfirm()

			let equalizerName = result.data.name

			if (equalizerName) {
				window.ipc.deleteEqualizer(equalizerName).then(result => {
					if (result.code === 'OK') {
						let indexToDelete = $equalizerProfiles.findIndex(x => x.name === equalizerName)

						$equalizerProfiles.splice(indexToDelete, 1)

						$equalizerProfiles = $equalizerProfiles

						if ($selectedEqName === equalizerName) {
							$selectedEqName = 'Default'
						}

						notifyService.success('Equalizer successfully deleted.')
					}
				})
			}
		})
	}

	function addNewProfile(newName: string = '') {
		let promptState: PromptStateType = {
			title: 'New Profile Name',
			placeholder: 'Enter new profile name',
			confirmButtonText: 'Confirm',
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
				newEqualizerProfile.values[$equalizer[i].frequency.value] = 0
			}

			window.ipc.addNewEqualizerProfile(newEqualizerProfile).then(result => {
				if (result.code === 'EXISTS') {
					notifyService.error(`Name ${newEqualizerProfile.name} already exists.`)
					addNewProfile(newEqualizerProfile.name)
				} else if (result.code === 'OK') {
					$equalizerProfiles.unshift(newEqualizerProfile)

					$equalizerProfiles = $equalizerProfiles
					$selectedEqName = newEqualizerProfile.name
				}
			})
		})
	}
</script>

<equalizer-profiles>
	{#each $equalizerProfiles as eqProfile (eqProfile.name)}
		<equalizer-field id="eq-{eqProfile.name}">
			<equalizer-name
				class={$currentEqHash === eqProfile.hash ? 'current' : ''}
				on:click={() => equalizerServiceNew.saveEqHashConfigFn(eqProfile.hash)}
				on:click={() => ($currentEqHash = eqProfile.hash)}
				on:click={() => equalizerServiceNew.loadEqualizerValuesFn(eqProfile.values)}
				on:click={() => ($equalizerNameStore = eqProfile.name)}>{eqProfile.name}</equalizer-name
			>
			<equalizer-rename class="eqProfileButton" on:click={() => renameEq(eqProfile.name)}>
				<EditIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
				Rename
			</equalizer-rename>
			<equalizer-delete class="eqProfileButton" on:click={() => deleteEq(eqProfile.name)}>
				<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
				Delete
			</equalizer-delete>
		</equalizer-field>
	{/each}
</equalizer-profiles>
<button class="addProfile" on:click={() => addNewProfile()}
	><AddIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" /> Add new profile</button
>

<style>
	equalizer-profiles {
		/* width: var(--clamp-width); */
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

	equalizer-name {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	equalizer-name::before {
		content: '';
		height: 0.33rem;
		width: 0.33rem;
		border-radius: 100vmax;
		display: inline-block;
		background-color: currentColor;
		margin-right: 0.25rem;
		opacity: 0;

		transition: opacity 250ms ease-in-out;
	}

	equalizer-name.current::before {
		opacity: 1;
	}
	equalizer-rename:hover {
		background-color: var(--color-reactBlue);
	}

	equalizer-delete:hover {
		background-color: var(--color-hl-2);
	}

	button.addProfile {
		display: flex;
		align-items: center;
		max-width: fit-content;
		margin: 1rem auto 0 auto;
	}
</style>
