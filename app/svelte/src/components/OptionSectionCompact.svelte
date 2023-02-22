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
		align-items: center;
	}

	section-title {
		font-size: 1rem;
		margin-right: 0.5rem;
	}

	section[id=''] section-title {
		margin-right: 0;
	}
</style>
