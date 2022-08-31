<script lang="ts">
	import { layoutToShow } from '../../stores/main.store'
	import { selectedConfigOptionName } from '../../stores/session.store'

	function handleAddFolder() {
		$selectedConfigOptionName = 'Library'
		$layoutToShow = 'Config'
	}
</script>

<no-song-svlt>
	<p>No songs found!</p>
	<button on:click={() => handleAddFolder()}>Click here to add songs</button>
</no-song-svlt>

<style>
	no-song-svlt {
		grid-area: art-grid-svlt;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		font-variation-settings: 'wght' 800;
	}

	no-song-svlt p {
		font-size: 2.5rem;

		line-height: normal;
		margin-bottom: 1rem;
	}
	no-song-svlt button {
		font-size: 1.25rem;
		padding: 0.5rem 1rem;
		line-height: normal;

		background-color: var(--color-hl-blue);

		font-variation-settings: inherit;
	}
</style>
