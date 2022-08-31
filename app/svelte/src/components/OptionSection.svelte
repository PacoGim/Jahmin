<script lang="ts">
	export let title = ''
</script>

<section id={title}>
	<section-title>{title}</section-title>
	<slot />
</section>

<style>
	section {
		margin-bottom: 1rem;
	}
	section-title {
		font-size: 1.2rem;
		display: block;
		border-bottom: 2px var(--color-fg-1) solid;
		margin-bottom: 1rem;
	}
</style>
