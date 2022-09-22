<script lang="ts">
	export let title = ''
</script>

<section id={title}>
	<section-title>{title}</section-title>
	<slot />
</section>

<style>
	section {
		margin-bottom: 2rem;
		color: var(--color-fg-1);
	}
	section-title {
		font-size: 1.2rem;
		display: block;
		border-bottom: 2px var(--color-fg-1) solid;
		padding-bottom: 0.5rem;
		padding-left: 0.5rem;
		margin-bottom: 2rem;
		font-variation-settings: 'wght' calc(var(--default-weight));
	}
</style>
