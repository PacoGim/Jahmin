<script>
	import { selectedOptionSection } from '../store/final.store'

	export let title = ''
</script>

<section on:mouseover={() => ($selectedOptionSection = title)} on:focus>
	<section-title>{title}</section-title>
	<slot name="body" />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		padding: 1rem;
	}

	section-title {
		margin-bottom: 2rem;
		width: 100%;

		font-size: 1.5rem;
		font-variation-settings: 'wght' calc(var(--default-weight) - 150);

		border-bottom: 1px var(--color-fg-1) solid;
	}

	section-title:empty {
		border-bottom: none;
	}
</style>
