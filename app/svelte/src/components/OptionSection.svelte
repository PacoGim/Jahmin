<script lang="ts">
	import traduceFn from '../functions/traduce.fn'

	export let title = ''
</script>

<section id={title} class="smooth-colors">
	<section-title class="smooth-colors">{title}</section-title>
	<slot />
</section>

<style>
	section {
		margin-bottom: 1rem;
		color: var(--color-fg-1);

		background-color: var(--color-bg-3);
		padding: 1rem;

		border-radius: 10px 30px;
	}

	section-title {
		display: flex;

		font-size: 1.2rem;

		background-color: var(--color-bg-2);
		margin-bottom: 1rem;
		font-variation-settings: 'wght' 700;

		border-radius: 10px 20px;

		letter-spacing: 0.25px;

		padding: 1rem;
	}
</style>
