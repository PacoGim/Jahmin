<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let textWeight = 500
	let textSize = 16
	let textAlignment = 0

	$: dispatch('textWeightChange', textWeight)
	$: dispatch('textSizeChange', textSize)
	$: dispatch('textAlignmentChange', textAlignment)
</script>

<lyrics-read-edit-controls>
	<text-weight class="text-control">
		<icon> Weight </icon>

		<range-input>
			<input type="range" min="100" max="800" step="100" bind:value={textWeight} />
		</range-input>
	</text-weight>

	<text-size class="text-control">
		<icon> Size </icon>

		<range-input>
			<input type="range" min="8" max="24" bind:value={textSize} />
		</range-input>
	</text-size>

	<text-align class="text-control">
		<icon> Alignment </icon>

		<range-input>
			<input type="range" min="0" max="2" bind:value={textAlignment} />
		</range-input>
	</text-align>
</lyrics-read-edit-controls>

<style>
	lyrics-read-edit-controls {
		position: absolute;
		right: 20px;
		top: 10px;

		display: flex;
		flex-direction: column;
	}

	.text-control {
		display: flex;
		flex-direction: row-reverse;
	}
</style>
