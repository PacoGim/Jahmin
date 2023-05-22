<script lang="ts">
	import limitCharactersFn from '../../functions/limitCharacters.fn'

	export let lyricList = []
</script>

<lyrics-list>
	{#each lyricList as lyric, index (index)}
		<lyric-container>{limitCharactersFn(`${lyric.title} - ${lyric.artist}`, 40)}</lyric-container>
	{/each}
</lyrics-list>

<style>
	lyrics-list {
		background-color: var(--color-bg-2);
		display: flex;
		flex-direction: column;
		padding: 1rem;
		overflow-y: auto;

		min-width: 300px;
	}

	lyrics-list lyric-container {
		background-color: var(--color-bg-3);
		padding: 0.5rem 1rem;
		margin: 0.5rem;
		white-space: nowrap;
		font-size: .9rem;
	}
</style>
