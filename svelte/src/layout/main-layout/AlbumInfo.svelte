<script lang="ts">
	import parseDuration from '../../functions/parseDuration.fn'

	import { playbackCursor, playbackStore } from '../../store/final.store'

	let totalDuration = ''
	let totalDurationLeft = ''

	$: {
		$playbackStore
		sumDuration()
	}

	$: {
		$playbackCursor
		sumLeftDuration()
	}

	function sumDuration() {
		let tempDurationSum = 0
		$playbackStore.forEach(song => (tempDurationSum += song.Duration))

		totalDuration = parseDuration(tempDurationSum)
	}

	function sumLeftDuration() {
		let playingSongIndex = $playbackCursor[0]
		let tempLeftDurationSum = 0

		for (let i = playingSongIndex; i <= $playbackStore.length; i++) {
			if ($playbackStore[i]) {
				tempLeftDurationSum += $playbackStore[i].Duration
			}
		}

		totalDurationLeft = parseDuration(tempLeftDurationSum)
	}
</script>

<album-info-svlt>
	<p>Playback</p>
	<p>{totalDuration} (-{totalDurationLeft})</p>
</album-info-svlt>

<style>
	album-info-svlt {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		background-color: var(--high-color);
		color: var(--low-color);
		grid-area: album-info-svlt;

		transition-property: background-color, color;
		transition-duration: 300ms;
		transition-timing-function: ease-in-out;
	}

	p {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
