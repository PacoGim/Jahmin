<script lang="ts">
	import { playingSongStore } from '../store/final.store'

	let currentSong = $playingSongStore
	let songInfoElement = document.getElementById('song-info')


	$: $playingSongStore, (currentSong = $playingSongStore)

	$:{
			console.log(songInfoElement)
	}

	function fixNumber(num: number) {
		return num < 10 ? '0' + num : num
	}
</script>

<statusbar-svlt>
	{#if currentSong}
		<song-info>
			<!-- svelte-ignore a11y-distracting-elements -->
			<marquee scrollAmount="0">
				<bold>{fixNumber(currentSong.Track)}</bold> <bold>{currentSong.Title}</bold> by <bold>{currentSong.Artist}</bold> from
				<bold>{currentSong.Album}</bold>
			</marquee>
		</song-info>
	{/if}
</statusbar-svlt>

<style>
	statusbar-svlt {
		grid-area: statusbar-svlt;

		display: flex;
		align-items: center;
		justify-content: center;

		height: 24px;

		text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.33);

		font-variation-settings: 'wght' calc(var(--default-weight) - 100);

		color: var(--high-color);
		background-color: var(--low-color);

		transition-property: color, background-color;
		transition-duration: 300ms;
		transition-timing-function: linear;

		overflow: hidden;
		position: relative;
	}

	bold {
		font-variation-settings: 'wght' calc(var(--default-weight) + 200);
	}

	song-info {
		font-size: 0.9rem;
		width: 25%;
	}

	/* Move it (define the animation) */
	@keyframes scroll-left {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
</style>
