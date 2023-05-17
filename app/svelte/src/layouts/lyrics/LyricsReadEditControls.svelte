<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let fontWeight
	export let fontSize
	export let textAlignment

	$: dispatch('fontWeightChange', fontWeight)
	$: dispatch('fontSizeChange', fontSize)
	$: dispatch('textAlignmentChange', textAlignment)
</script>

<lyrics-read-edit-controls>
	<text-weight class="text-control">
		<icon class="bold"> B </icon>

		<range-input>
			<input type="range" min="200" max="1000" step="50" bind:value={fontWeight} />
		</range-input>

		<span>{fontWeight}</span>
	</text-weight>

	<text-size class="text-control">
		<icon> Aa </icon>

		<range-input>
			<input type="range" min="8" max="24" bind:value={fontSize} />
		</range-input>

		<span>{fontSize}</span>
	</text-size>

	<text-align class="text-control">
		<icon> Alignment </icon>

		<range-input>
			<input type="range" min="0" max="2" bind:value={textAlignment} />
		</range-input>

		<alignments>
			<alignement-left>Left</alignement-left>
			<alignement-center>Center</alignement-center>
			<alignement-right>Right</alignement-right>
		</alignments>
	</text-align>
</lyrics-read-edit-controls>

<style>
	lyrics-read-edit-controls {
		display: flex;
		flex-direction: row;

		grid-area: lyrics-read-edit-controls;
	}

	.text-control {
		display: flex;
		flex-direction: column;
		text-align: center;
		justify-content: center;

		margin: 0 1rem;
	}

	range-input {
		margin: 0.5rem 0;
		/* background-color: red; */
	}

	range-input input {
		width: 100px;
	}

	icon {
		display: flex;
		justify-content: center;
		align-items: center;
		align-self: center;
		background-color: var(--color-accent-4);
		color: #fff;
		padding: 0.25rem 0.5rem;
		width: 2rem;
		height: 2rem;
		border-radius: 3px;
	}

	icon.bold {
		font-variation-settings: 'wght' 800;
	}
</style>
