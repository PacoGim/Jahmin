<script lang="ts">
  import traduceFn from '../../functions/traduce.fn'
	import { configOptionSelected, layoutToShow } from '../../stores/main.store'

	function handleAddFolder() {
		$configOptionSelected = 'Library'
		$layoutToShow = 'Config'
	}
</script>

<no-song-svlt>
	<p>{traduceFn("I can't find any songs!")}</p>
	<img src="./assets/img/files_not_found.webp" alt="" />
	<button on:click={handleAddFolder}>{traduceFn('Click here to add songs')}</button>
</no-song-svlt>

<style>
	no-song-svlt {
		grid-area: art-grid-svlt;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		font-variation-settings: 'wght' 700;
	}

	no-song-svlt p {
		font-size: 2.75rem;

		line-height: normal;
		margin-bottom: 1rem;

		padding: 0.5rem 1rem;

		border-radius: 10px;

		text-align: center;

		border: 4px var(--color-fg-1) solid;

		position: relative;
	}

	no-song-svlt p::after {
		content: '';
		position: absolute;
		border-style: solid;
		border-width: 15px 15px 0;
		border-color: var(--color-fg-1) transparent;
		display: block;
		width: 0;
		z-index: 1;
		bottom: -15px;
		left: 50%;
	}

	img {
		display: block;
		height: 10rem;
	}

	button {
		padding: .5rem .75rem;
		font-size: 1rem;
	}
</style>
