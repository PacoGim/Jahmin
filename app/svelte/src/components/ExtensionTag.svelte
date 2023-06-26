<script lang="ts">
	import FlacIcon from '../icons/FlacIcon.svelte'
	import Mp3Icon from '../icons/MP3Icon.svelte'
	import OpusIcon from '../icons/OpusIcon.svelte'
	import { showExtensionsIconsConfig } from '../stores/config.store'

	export let extension
</script>

<extension-tag>
	{#if $showExtensionsIconsConfig}
		{#if extension === 'opus'}
			<OpusIcon style="width: 2rem;fill: currentColor;" />
		{/if}
		{#if extension === 'mp3'}
			<Mp3Icon style="width: 2rem;fill: currentColor;" />
		{/if}
		{#if extension === 'flac'}
			<FlacIcon style="width: 2rem;fill: currentColor;" />
		{/if}
		{#if extension === 'm4a'}
			<m4a-icon>M4A</m4a-icon>
		{/if}
	{:else}
		{extension}
	{/if}
</extension-tag>

<style>
	extension-tag {
		display: flex;
		margin: 0 0.5rem;
	}

	m4a-icon {
		font-variation-settings: 'wght' 700;
	}
</style>
