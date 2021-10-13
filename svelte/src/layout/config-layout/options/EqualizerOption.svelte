<script lang="ts">
	import Prompt from '../../../components/Prompt.svelte'

	import OptionSection from '../../../components/OptionSection.svelte'
	import EditIcon from '../../../icons/EditIcon.svelte'
	import { equalizerProfiles, selectedEqId, equalizer } from '../../../store/equalizer.store'
	import type { EqualizerType } from '../../../types/equalizer.type'

	let isEqualizerEnabled = true
	let showModal = false

	let data

	// let audioFiltersCopy: EqualizerType = $selectedEq
	let equalizerName = ''

	$: {
		$selectedEqId
		equalizerName = getEqualizerName()
	}

	function gainChange(evt: Event, frequency: number) {
		const target = evt.target as HTMLInputElement
		const value = Number(target.value)

		$equalizer[frequency].gain.value = value
	}

	function getEqualizerName(): string {
		let equalizerProfileFound = $equalizerProfiles.find(x => x.id === $selectedEqId)
		if (equalizerProfileFound) {
			return equalizerProfileFound?.name || 'No Name'
		}
	}

	function objectToArray(inObject: object) {
		let tempArray = []
		for (const key in inObject) {
			tempArray.push(inObject[key])
		}
		return tempArray
	}

	function renameEq(id: string, name: string) {
		data = { id, name, inputValue: name }
		showModal = true
	}

	function deleteEq(id: string, name: string) {
		if (confirm(`Do you really want to delete profile ${name}`)) {
			console.log('To delete')
		} else {
			console.log('Dont delete')
		}
	}

	function toggleEq() {}

	function handleRenameResponse(event) {
		console.log(event.detail)
		showModal = false
	}
</script>

<OptionSection title="Equalizer">
	<equalizer-section slot="body">
		<p-center>Saved Equalizers</p-center>
		<equalizer-list>
			{#each $equalizerProfiles as eq (eq.id)}
				<equalizer-field id="eq-{eq.id}">
					<equalizer-name on:click={() => ($selectedEqId = eq.id)}>{eq.name}</equalizer-name>
					<equalizer-rename on:click={() => renameEq(eq.id, eq.name)}
						>Rename <EditIcon style="height:1rem;width:auto;fill:var(--color-fg-1);" /></equalizer-rename
					>
					<equalizer-delete on:click={() => deleteEq(eq.id, eq.name)}>Delete X</equalizer-delete>
				</equalizer-field>
			{/each}
		</equalizer-list>
		<selected-equalizer-name>{equalizerName}</selected-equalizer-name>
		<audio-filters>
			{#each objectToArray($equalizer) as equalizer, index (index)}
				<audio-filter-range>
					<filter-frequency>{equalizer.frequency.value} Hz</filter-frequency>
					<eq-input-container>
						<input
							type="range"
							min="-10"
							max="10"
							step="1"
							value={equalizer.gain.value}
							on:input={evt => {
								gainChange(evt, equalizer.frequency.value)
							}}
						/>
					</eq-input-container>
					<filter-gain>{equalizer.gain.value} dB</filter-gain>
				</audio-filter-range>
			{/each}
		</audio-filters>
		<button class={isEqualizerEnabled ? 'active' : 'not-active'} on:click={() => toggleEq()}>Toggle EQ</button>
	</equalizer-section>
</OptionSection>

<Prompt
	title="Rename Equalizer Preset"
	placeholder="Equalizer new name"
	{data}
	confirmButtonText="Rename"
	{showModal}
	on:close={() => (showModal = false)}
	on:response={event => handleRenameResponse(event)}
/>

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
		background-color: crimson;
	}

	selected-equalizer-name {
		margin: 1rem 0;
		display: block;
		text-align: center;
	}

	audio-filter-range eq-input-container {
		margin: 1rem 0;
	}

	audio-filter-range filter-frequency {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 450;
	}

	audio-filter-range filter-gain {
		font-size: 0.9rem;
		font-variation-settings: 'wght' 450;
	}

	button {
		color: #fff;
	}
	button.not-active {
		background-color: crimson;
	}
	button.active {
		background-color: var(--color-hl-1);
	}
	audio-filters {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		margin: 0 auto;
		width: max-content;
	}
	audio-filter-range {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 1rem;
	}

	eq-input-container {
		--bar-width: 20px;
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
	}

	input[type='range']::-webkit-slider-thumb {
		border-radius: 50px;
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		outline: none;
		background-color: hsl(0, 0%, 50%);
		border: 1px solid hsl(0, 0%, 50%);
	}
</style>
