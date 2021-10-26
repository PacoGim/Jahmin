<script lang="ts">
	import Prompt from '../../../components/Prompt.svelte'

	import OptionSection from '../../../components/OptionSection.svelte'
	import EditIcon from '../../../icons/EditIcon.svelte'

	import { equalizerProfiles, selectedEqId, equalizer, isEqualizerDirty } from '../../../store/equalizer.store'

	import { PromptTasks } from '../../../types/promptState.type'

	import type { PromptStateType } from '../../../types/promptState.type'
	import generateId from '../../../functions/generateId.fn'

	import {
		addNewEqualizerProfileIPC,
		deleteEqualizerIPC,
		showEqualizerFolderIPC,
		renameEqualizerIPC,
	} from '../../../service/ipc.service'

	import type { EqualizerFileObjectType } from '../../../types/equalizerFileObject.type'
	import Confirm from '../../../components/Confirm.svelte'
	import type { ConfirmStateType } from '../../../types/confirmState.type'

	import notify from '../../../service/notify.service'
	import EqualizerService from '../../../svelte-service/EqualizerService.svelte'
	import { objectToArray } from '../../../service/index.service'

	let equalizerService

	let isEqualizerOn = true
	let equalizerName = ''

	let showPrompt = false
	let showConfirm = false

	let promptState: PromptStateType = {
		title: '',
		placeholder: '',
		confirmButtonText: '',
		cancelButtonText: '',
		task: PromptTasks.None,
		data: {}
	}

	let confirmState: ConfirmStateType = {
		title: '',
		textToConfirm: '',
		data: {}
	}

	$: if ($selectedEqId) equalizerName = equalizerService.getEqualizerName($selectedEqId)

	function renameEq(id: string, name: string) {
		promptState = {
			title: 'Rename Equalizer Preset',
			placeholder: 'Equalizer new name',
			confirmButtonText: 'Rename',
			cancelButtonText: 'Cancel',
			task: PromptTasks.Rename,
			data: { id, name, inputValue: name }
		}

		showPrompt = true
	}

	function deleteEq(id: string, name: string) {
		if (id === 'Default') {
			return notify.error("Default profile can't be deleted")
		}

		confirmState = {
			textToConfirm: `Delete equalizer "${name}"?`,
			title: 'Delete Equalizer',
			data: {
				id
			}
		}

		showConfirm = true
	}

	function handlePromptResponse(event: CustomEvent) {
		let eqId = event.detail.data.id
		let newName = event.detail.data.response

		// Save As
		if (event.detail.task === 'SaveAs') {
			let newEqualizerProfile: EqualizerFileObjectType = {
				id: eqId,
				name: newName,
				values: []
			}

			for (let i in $equalizer) {
				newEqualizerProfile.values.push({ frequency: $equalizer[i].frequency.value, gain: $equalizer[i].gain.value })
			}

			addNewEqualizerProfileIPC(newEqualizerProfile).then(result => {
				if (result.code === 'EXISTS') {
					notify.error(`Name ${newName} already exists.`)
				} else if (result.code === 'OK') {
					$equalizerProfiles.unshift(newEqualizerProfile)

					$equalizerProfiles = $equalizerProfiles
					$selectedEqId = newEqualizerProfile.id

					showPrompt = false
				}
			})
			// Rename
		} else if (event.detail.task === 'Rename') {
			renameEqualizerIPC(eqId, newName).then(result => {
				if (result.code === 'OK') {
					let equalizerFound = $equalizerProfiles.find(x => x.id === eqId)

					if (equalizerFound) {
						equalizerFound.name = newName
						$equalizerProfiles = $equalizerProfiles
					}

					notify.success(`Equalizer renamed to "${newName}"`)

					showPrompt = false
				} else if (result.code === 'EXISTS') {
					notify.error(`Name ${newName} already exists.`)
				}
			})
		}
	}

	function handleConfirmResponse(event: CustomEvent) {
		showConfirm = false

		let equalizerId = event?.detail?.id

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
	}

	function saveEqualizerAs() {
		promptState = {
			title: 'Enter Equalizer Name',
			placeholder: 'Equalizer name',
			confirmButtonText: 'Save As',
			cancelButtonText: 'Cancel',
			task: PromptTasks.SaveAs,
			data: { id: generateId(), name: '', inputValue: '' }
		}

		showPrompt = true
	}
</script>

<OptionSection title="Equalizer">
	<equalizer-section slot="body">
		<p-center>Saved Equalizers</p-center>
		<equalizer-list>
			{#each $equalizerProfiles as eq (eq.id)}
				<equalizer-field id="eq-{eq.id}">
					<equalizer-name on:click={() => equalizerService.changeProfile(eq.id)}
						>{$selectedEqId === eq.id ? '‣ ' : ''} {eq.name}</equalizer-name
					>
					<equalizer-rename on:click={() => renameEq(eq.id, eq.name)}
						>Rename <EditIcon style="height:1rem;width:auto;fill:var(--color-fg-1);" /></equalizer-rename
					>
					<equalizer-delete on:click={() => deleteEq(eq.id, eq.name)}>Delete X</equalizer-delete>
				</equalizer-field>
			{/each}
		</equalizer-list>
		<selected-equalizer-name>{equalizerName} {$isEqualizerDirty && isEqualizerOn ? '•' : ''}</selected-equalizer-name>
		<audio-filters>
			{#each objectToArray($equalizer) as equalizer, index (index)}
				<audio-filter-range>
					<filter-frequency>{equalizer.frequency.value} Hz</filter-frequency>
					<eq-input-container>
						<input
							type="range"
							min="-8"
							max="8"
							step="1"
							value={equalizer.gain.value}
							on:input={evt => equalizerService.gainChange(evt, equalizer.frequency.value)}
							disabled={!isEqualizerOn}
						/>
					</eq-input-container>
					<filter-gain>{equalizer.gain.value} dB</filter-gain>
				</audio-filter-range>
			{/each}
		</audio-filters>
		<buttons>
			<button on:click={() => showEqualizerFolderIPC()}>Show Folder</button>
			<button class={isEqualizerOn ? 'active' : 'not-active'} on:click={() => equalizerService.toggleEq()}>Toggle EQ</button>
			<button
				on:click={() => equalizerService.resetEqualizer()}
				disabled={$isEqualizerDirty === false || isEqualizerOn === false}>Reset</button
			>
			<button on:click={() => saveEqualizerAs()}>Save as...</button>
			<button on:click={() => equalizerService.updateEqualizer()} disabled={!$isEqualizerDirty}>Update</button>
		</buttons>
	</equalizer-section>
</OptionSection>

<Prompt {promptState} {showPrompt} on:close={() => (showPrompt = false)} on:response={event => handlePromptResponse(event)} />
<Confirm
	{confirmState}
	{showConfirm}
	on:close={() => (showConfirm = false)}
	on:response={event => handleConfirmResponse(event)}
/>

<EqualizerService bind:this={equalizerService} />

<style>
	equalizer-list {
		width: fit-content;
		max-height: 10rem;
		display: block;
		overflow-y: scroll;
		width: 33%;
		margin: 0 auto;
		margin-top: 1rem;
	}
	equalizer-list equalizer-field {
		cursor: pointer;
		display: grid;
		grid-template-columns: auto max-content max-content;
		transition: background-color 150ms ease-in-out;
	}

	equalizer-list equalizer-field * {
		transition: background-color 150ms ease-in-out;
	}

	equalizer-list equalizer-field:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	equalizer-list equalizer-field equalizer-name {
		padding: 0.25rem 0.5rem;
	}

	equalizer-list equalizer-field equalizer-rename {
		display: flex;
		padding: 0.25rem 0.5rem;
		height: inherit;
		margin-right: 1rem;

		font-size: 0.85rem;
		font-variation-settings: 'wght' 450;
	}

	:global(equalizer-list equalizer-field equalizer-rename svg) {
		margin-left: 0.25rem;
	}

	equalizer-list equalizer-field equalizer-rename:hover {
		background-color: var(--color-hl-1);
	}

	equalizer-list equalizer-field equalizer-delete {
		margin-right: 1rem;
		padding: 0.25rem 0.5rem;

		font-size: 0.85rem;
		font-variation-settings: 'wght' 500;
	}

	equalizer-list equalizer-field equalizer-delete:hover {
		background-color: var(--color-hl-2);
	}

	selected-equalizer-name {
		margin: 1rem 0;
		display: block;
		text-align: center;
	}

	audio-filter-range eq-input-container {
		margin: 1rem 0;
	}

	audio-filter-range eq-input-container input:disabled {
		cursor: not-allowed;
	}
	audio-filter-range eq-input-container input[type='range']:disabled::-webkit-slider-thumb {
		background-color: var(--color-hl-2);
	}

	audio-filter-range filter-frequency {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 500;
	}

	audio-filter-range filter-gain {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 500;
	}

	buttons button {
		color: #fff;
		background-color: var(--color-hl-1);

		transition: background-color 300ms linear;
	}
	buttons button.not-active {
		background-color: var(--color-hl-2);
	}
	buttons button:disabled {
		cursor: not-allowed;
		background-color: hsl(228, 15%, 49%);
		/* background-color: hsl(0, 0%, 50%); */
		/* text-shadow: 0 0 10px #000; */
	}

	audio-filters {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		margin: 0 auto;
		margin-bottom: 1rem;
		width: max-content;
	}
	audio-filter-range {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 1rem;
	}

	eq-input-container {
		--bar-width: 10px;
		--bar-height: 250px;
		width: var(--bar-width);
		height: var(--bar-height);
	}

	input[type='range'] {
		cursor: pointer;
		border-radius: 50px;
		width: var(--bar-height);
		height: var(--bar-width);
		transform-origin: calc(var(--bar-height) / 2) calc(var(--bar-height) / 2);
		transform: rotate(-90deg);

		-webkit-appearance: none;

		outline: none;

		background-color: hsl(0, 0%, 90%);

		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.25); /* x | y | blur | spread | color */
	}

	input[type='range']::-webkit-slider-thumb {
		border-radius: 50px;
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		outline: none;
		background-color: var(--color-hl-1);
		box-shadow: 0px 0px 0px 5px hsl(0, 0%, 90%), 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
	}
</style>
