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
		display: flex;
		flex-direction: row;
		/* border-bottom: 2px var(--color-fg-1) solid; */
	}

	section-title {
		font-size: 1.2rem;
		margin-right: 0.5rem;
	}
</style>
