<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import { onMount } from 'svelte'

	import equalizerServiceNew from '../../../services/equalizer/!equalizer.service'

	let communityProfiles = []

	onMount(() => {
		window.ipc.getCommunityEqualizerProfiles().then(results => {
			communityProfiles = results
		})
	})
</script>

<equalizer-profiles-community>
	{#each communityProfiles as eqProfile, index (index)}
		<p on:click={() => equalizerServiceNew.loadEqualizerValuesFn(eqProfile.values)}>{eqProfile.name} {eqProfile.hash}</p>
	{/each}
</equalizer-profiles-community>
