<script lang="ts">
	import limitCharactersFn from '../../functions/limitCharacters.fn'
</script>

<lyrics-list>
	<!-- <lyric-container
		>{limitCharactersFn(
			'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veritatis, blanditiis.',
			30
		)}</lyric-container
	>
	<lyric-container
		>{limitCharactersFn('Quo, numquam hic reprehenderit veniam eligendi sed beatae optio necessitatibus.', 30)}</lyric-container
	>
	<lyric-container>{limitCharactersFn('Quos ad neque sed repellat reiciendis, enim hic nobis soluta.', 30)}</lyric-container>
	<lyric-container
		>{limitCharactersFn(
			'Repudiandae vitae mollitia temporibus officiis nostrum? Autem non perspiciatis expedita.',
			30
		)}</lyric-container
	> -->
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
	}
</style>
