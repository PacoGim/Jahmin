<script lang="ts">
	import ArtGridConfig from '../looks-sections/ArtGridConfigSection.svelte'
	import ColorContrastConfig from '../looks-sections/ColorContrastConfigSection.svelte'
	import ThemeConfig from '../looks-sections/LooksConfigSection.svelte'
</script>

<looks-options-svlt>
	<ThemeConfig />
	<ArtGridConfig />
	<ColorContrastConfig />
</looks-options-svlt>

<style>
	options-name {
		display: block;
		text-align: center;
		font-size: 1.75rem;
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
		margin-top: 1rem;
	}
</style>
