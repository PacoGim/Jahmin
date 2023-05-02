<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import EqualizerProfilesOnline from './EqualizerProfilesCommunity.svelte'
	import EqualizerProfilesUser from './EqualizerProfilesUser.svelte'
</script>

<equalizer-profiles-config>
	<user-profiles class="profiles-container">
		<span>Your Profiles</span>
		<EqualizerProfilesUser />
	</user-profiles>

	<community-profiles class="profiles-container">
		<span>Community Profiles</span>
		<EqualizerProfilesOnline />
	</community-profiles>
</equalizer-profiles-config>

<style>
	equalizer-profiles-config {
		display: grid;
		grid-template-columns: 5fr 3fr;

		/* max-height: 10rem; */
		/* min-height: 10rem; */
	}

	.profiles-container {
		padding: 1rem;
		background-color: var(--color-bg-2);
		border-radius: 10px 20px;
	}

	.profiles-container span {
		text-align: center;
		display: block;
		font-size: 1.15rem;
		font-variation-settings: 'wght' 650;
		letter-spacing: 0.2px;
	}
	user-profiles {
		margin-right: 0.5rem;
	}

	community-profiles {
		margin-left: 0.5rem;
	}

	/* :global() */
</style>
