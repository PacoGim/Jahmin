<script lang="ts">
	import AddIcon from '../../../icons/AddIcon.svelte'
	import DeleteIcon from '../../../icons/DeleteIcon.svelte'
	import EditIcon from '../../../icons/EditIcon.svelte'

	import { currentEqHash, equalizerProfiles, currentEqProfile } from '../../../stores/equalizer.store'

	import equalizerService from '../../../services/equalizer/!equalizer.service'
	import traduceFn from '../../../functions/traduce.fn'

	function onEqualizerNameClickEvent(eqProfile) {
		equalizerService.saveEqHashConfigFn(eqProfile.hash)
		$currentEqHash = eqProfile.hash
		$currentEqProfile = eqProfile
		equalizerService.loadEqualizerValuesFn(eqProfile.values)
	}
</script>

<equalizer-profiles class="smooth-colors">
	{#each $equalizerProfiles as eqProfile (eqProfile.hash)}
		<equalizer-field id="eq-{eqProfile.hash}">
			<equalizer-name
				class={$currentEqHash === eqProfile.hash ? 'current' : ''}
				on:click={() => onEqualizerNameClickEvent(eqProfile)}
				on:keypress={() => onEqualizerNameClickEvent(eqProfile)}
				tabindex="-1"
				role="button">{traduceFn(eqProfile.name)}</equalizer-name
			>
			<equalizer-rename
				class="eqProfileButton"
				on:click={() => equalizerService.renameEqualizerFn(eqProfile.hash, eqProfile.name)}
				on:keypress={() => equalizerService.renameEqualizerFn(eqProfile.hash, eqProfile.name)}
				tabindex="-1"
				role="button"
			>
				<EditIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
				{traduceFn('Rename')}
			</equalizer-rename>
			<equalizer-delete
				class="eqProfileButton"
				on:click={() => equalizerService.deleteEqualizerFn(eqProfile.hash, eqProfile.name)}
				on:keypress={() => equalizerService.deleteEqualizerFn(eqProfile.hash, eqProfile.name)}
				tabindex="-1"
				role="button"
			>
				<DeleteIcon style="height:1rem;width:auto;fill:#fff;margin-right:0.25rem;" />
				{traduceFn('Delete')}
			</equalizer-delete>
		</equalizer-field>
	{/each}
</equalizer-profiles>

<button class="addProfile" on:click={() => equalizerService.addEqualizerFn()}
	><AddIcon style="height:1.25rem;width:auto;fill:#fff;margin-right:0.25rem;" /> {traduceFn('Add new profile')}</button
>

<style>
	equalizer-profiles {
		display: block;
		overflow-y: auto;
		margin-top: 1rem;
		padding: 0.5rem;
		border-radius: 5px;

		max-height: 12rem;
		min-height: 12rem;

		background-color: var(--color-bg-3);
	}

	equalizer-profiles equalizer-field {
		display: grid;
		grid-template-columns: auto max-content max-content;

		padding-right: 0.5rem;
		border-radius: 5px;
		align-items: center;
	}

	.eqProfileButton {
		display: flex;
		padding: 0.25rem 0.5rem;
		height: inherit;

		font-size: 0.85rem;
		font-variation-settings: 'wght' 450;

		display: flex;
		align-items: center;
		font-variation-settings: 'wght' 700;
		letter-spacing: 0.4px;
		font-size: 0.75rem;
		cursor: pointer;
		color: #fff;
		background-color: var(--color-accent-1);
		border-radius: 3px;
		padding: 0.2rem 0.4rem;
	}

	equalizer-rename:first-of-type {
		margin-right: 0.5rem;
	}

	equalizer-profiles equalizer-field {
		transition: background-color 250ms ease-in-out;
	}

	equalizer-profiles equalizer-field:hover {
		background-color: var(--color-bg-1);
	}

	equalizer-name {
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 0.5rem;
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
		background-color: var(--color-accent-2);
	}

	equalizer-delete:hover {
		background-color: var(--color-dangerRed);
	}

	button.addProfile {
		display: flex;
		align-items: center;
		max-width: fit-content;
		margin: 1rem auto 0 auto;
	}
</style>
