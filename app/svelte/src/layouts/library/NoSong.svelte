<script lang="ts">
	import ThreeDButton from '../../components/ThreeDButton.svelte'
	import { layoutToShow } from '../../stores/main.store'
	import { selectedConfigOptionName } from '../../stores/session.store'

	function handleAddFolder() {
		$selectedConfigOptionName = 'Library'
		$layoutToShow = 'Config'
	}

	/*
				--font-size="1.25rem"
		--bg-color="hsl(193, 95%, 68%)"
		--shadow-color="hsl(193, 95%, 48%)"
		--shadow-dark-color="hsl(193, 95%, 38%)"
		--font-weight="700"
		--padding-x="1rem"
		--padding-y="0.5rem"

	*/
</script>

<no-song-svlt>
	<p>No songs found!</p>
	<ThreeDButton
		on:buttonClick={handleAddFolder}
		colorName='reactBlue'
		fontSize="1.25rem"
		fontWeight="700"
		paddingX="1rem"
		paddingY="0.5rem"
	>Click here to add songs</ThreeDButton>
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

		color: var(--color-reactBlue);

		text-shadow:
			0 1px 0 hsl(193, 95%, 45%),
			0 2px 0 hsl(193, 95%, 45%),
			0 3px 0 hsl(193, 95%, 45%),
			0 4px 0 hsl(193, 95%, 45%),
			0 4px 3px hsl(193, 95%, 35%);
	}
</style>
