<script lang="ts">
	import ArtGridSection from '../looks-sections/ArtGridSection.svelte'
	import ThemeSection from '../looks-sections/ThemeSection.svelte'
</script>

<looks-options-svlt>
	<options-name>Looks</options-name>
	<ThemeSection />
	<ArtGridSection />
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
