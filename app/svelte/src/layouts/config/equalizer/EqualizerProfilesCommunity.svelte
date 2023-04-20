<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import { onMount } from 'svelte'

	import equalizerServiceNew from '../../../services/equalizer/!equalizer.service'
	import { currentEqHash, equalizerProfiles } from '../../../stores/equalizer.store'

	let communityProfiles = []

	onMount(() => {
		window.ipc.getCommunityEqualizerProfiles().then(results => {
			communityProfiles = results
		})
	})

	$: {
		console.log($equalizerProfiles)
	}
</script>

<equalizer-profiles-community>
	{#if communityProfiles.length > 0}
		{#each communityProfiles as eqProfile, index (index)}
			<equalizer-field id={eqProfile.hash}>
				<equalizer-name
					class={$currentEqHash === eqProfile.hash ? 'current' : ''}
					on:click={() => equalizerServiceNew.loadEqualizerValuesFn(eqProfile.values)}
					on:click={() => ($currentEqHash = eqProfile.hash)}
				>
					{eqProfile.name}
				</equalizer-name>
				<button
					disabled={$equalizerProfiles.findIndex(value => value.hash === eqProfile.hash) !== -1}
					on:click={() => equalizerServiceNew.saveNewEqualizerFn(eqProfile.values, eqProfile.name, eqProfile.hash)}
					>Download</button
				>
			</equalizer-field>
		{/each}
	{:else}
		<span>Fetching community profiles...</span>
	{/if}
</equalizer-profiles-community>

<style>
	equalizer-profiles-community {
		margin-top: 1rem;
		display: block;
	}

	equalizer-field {
		display: grid;
		grid-template-columns: auto max-content;

		margin-bottom: 0.25rem;
		align-items: center;
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

	button {
		display: flex;
		align-items: center;
		font-variation-settings: 'wght' 700;
		letter-spacing: 0.4px;
		font-size: 0.75rem;
		cursor: pointer;
		color: #fff;
		background-color: #00007a;
		border-radius: 3px;
		padding: 0.2rem 0.4rem;

		transition: background-color 250ms ease-in-out;
	}

	button:hover {
		background-color: #029aff;
	}

	button:disabled {
		filter: grayscale(1);
	}
</style>
