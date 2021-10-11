<script>
	export let title
</script>

<section>
	<section-title>{title}</section-title>
	<slot name="body" />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		/* width: 100%; */
	}

	/* slot {
		display: flex;
		flex-direction: column;
		align-items: center;
	} */

	section-title {
		margin-bottom: 2rem;
		width: 100%;

		font-size: 1.75rem;
		font-variation-settings: 'wght' calc(var(--default-weight) - 150);

		border-bottom: 1px white solid;
	}
</style>
