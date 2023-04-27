<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import { onMount } from 'svelte'

	import equalizerServiceNew from '../../../services/equalizer/!equalizer.service'
	import { currentEqHash, currentEqProfile, equalizerNameStore, equalizerProfiles } from '../../../stores/equalizer.store'
	import DownloadIcon from '../../../icons/DownloadIcon.svelte'
	import DownloadedIcon from '../../../icons/DownloadedIcon.svelte'
	import WarningIcon from '../../../icons/WarningIcon.svelte'
	import tippyService from '../../../services/tippy.service'
	import generateId from '../../../functions/generateId.fn'

	let communityProfiles = []

	function getWarning(eqValues) {
		let isDangerous = false

		for (let frequency in eqValues) {
			if (eqValues[frequency] > 4) {
				isDangerous = true
				setTimeout(() => {
					tippyService(
						'equalizer-profiles-community-loud-warning',
						'equalizer-profiles-community equalizer-field equalizer-name span.warning',
						{
							content: 'Warning: Contains loud values',
							theme: 'warning'
						}
					)
				}, 100)
				break
			}
		}

		return isDangerous
	}

	onMount(() => {
		window.ipc.getCommunityEqualizerProfiles().then(results => {
			communityProfiles = results
		})
	})
</script>

<equalizer-profiles-community>
	{#if communityProfiles.length > 0}
		{#each communityProfiles as eqProfile, index (index)}
			<equalizer-field id={eqProfile.hash}>
				<equalizer-name
					class={$currentEqHash === eqProfile.hash ? 'current' : ''}
					on:click={() => equalizerServiceNew.loadEqualizerValuesFn(eqProfile.values)}
					on:click={() => ($currentEqHash = eqProfile.hash)}
					on:click={() => ($currentEqProfile = eqProfile)}
					on:click={() => ($equalizerNameStore = eqProfile.name)}
				>
					{#if getWarning(eqProfile.values)}
						<span class="warning">
							<WarningIcon style="fill: var(--color-dangerRed); height: 1.25rem; margin-right: .2rem;" />
						</span>
					{/if}

					{eqProfile.name}
				</equalizer-name>

				{#if $equalizerProfiles.findIndex(value => value.hash === eqProfile.hash) !== -1}
					<button disabled><DownloadedIcon style="height: 1rem;fill: #3d3d3d;margin-right: .4rem;" /> Download</button>
				{:else}
					<button on:click={() => equalizerServiceNew.saveNewEqualizerFn(eqProfile.values, eqProfile.name, eqProfile.hash)}
						><DownloadIcon style="height: 1rem;fill: #fff;margin-right: .4rem;" /> Download</button
					>
				{/if}
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
		cursor: not-allowed;

		background-color: transparent;
		color: #3d3d3d;
		box-shadow: inset 0px 0px 0 1px #3d3d3d;
		border-radius: 3px;
	}
</style>
