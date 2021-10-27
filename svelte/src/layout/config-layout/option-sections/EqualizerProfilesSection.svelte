<script lang="ts">
	import EditIcon from '../../../icons/EditIcon.svelte'
	import { deleteEqualizerIPC, renameEqualizerIPC } from '../../../service/ipc.service'
	import notify from '../../../service/notify.service'

	import { equalizerProfiles, selectedEqId } from '../../../store/equalizer.store'
	import { confirmService, equalizerService, promptService } from '../../../store/service.store'

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
</script>

<equalizer-profiles-section>
	{#each $equalizerProfiles as eq (eq.id)}
		<equalizer-field id="eq-{eq.id}">
			<equalizer-name on:click={() => $equalizerService.changeProfile(eq.id)}
				>{$selectedEqId === eq.id ? '‣ ' : ''} {eq.name}</equalizer-name
			>
			<equalizer-rename on:click={() => renameEq(eq.id, eq.name)}
				>Rename <EditIcon style="height:1rem;width:auto;fill:var(--color-fg-1);" /></equalizer-rename
			>
			<equalizer-delete on:click={() => deleteEq(eq.id, eq.name)}>Delete X</equalizer-delete>
		</equalizer-field>
	{/each}
</equalizer-profiles-section>

<style>
	equalizer-profiles-section {
		width: fit-content;
		max-height: 10rem;
		display: block;
		overflow-y: scroll;
		width: 33%;
		margin: 0 auto;
		margin-top: 1rem;
	}
	equalizer-profiles-section equalizer-field {
		cursor: pointer;
		display: grid;
		grid-template-columns: auto max-content max-content;
		transition: background-color 150ms ease-in-out;
	}

	equalizer-profiles-section equalizer-field * {
		transition: background-color 150ms ease-in-out;
	}

	equalizer-profiles-section equalizer-field:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	equalizer-profiles-section equalizer-field equalizer-name {
		padding: 0.25rem 0.5rem;
	}

	equalizer-profiles-section equalizer-field equalizer-rename {
		display: flex;
		padding: 0.25rem 0.5rem;
		height: inherit;
		margin-right: 1rem;

		font-size: 0.85rem;
		font-variation-settings: 'wght' 450;
	}

	:global(equalizer-profiles-section equalizer-field equalizer-rename svg) {
		margin-left: 0.25rem;
	}

	equalizer-profiles-section equalizer-field equalizer-rename:hover {
		background-color: var(--color-hl-1);
	}

	equalizer-profiles-section equalizer-field equalizer-delete {
		margin-right: 1rem;
		padding: 0.25rem 0.5rem;

		font-size: 0.85rem;
		font-variation-settings: 'wght' 500;
	}

	equalizer-profiles-section equalizer-field equalizer-delete:hover {
		background-color: var(--color-hl-2);
	}
</style>
