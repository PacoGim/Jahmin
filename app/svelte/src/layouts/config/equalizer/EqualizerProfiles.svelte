<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
	import EqualizerProfilesOnline from './EqualizerProfilesOnline.svelte'
	import EqualizerProfilesUser from './EqualizerProfilesUser.svelte'
</script>

<equalizer-profiles-config>
	<user-profiles>
		<h2>Your Profiles</h2>
		<EqualizerProfilesUser />
	</user-profiles>

	<online-profiles>
		<h2>Online Profiles</h2>
		<EqualizerProfilesOnline />
	</online-profiles>
</equalizer-profiles-config>

<style>
	equalizer-profiles-config {
		display: grid;
		grid-template-columns: 2fr 1fr;
	}
</style>
