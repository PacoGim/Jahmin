<script lang="ts">
	import { playbackCursor, playbackStore } from '../store/final.store'

	export let player: HTMLAudioElement

	function previousButtonEvent() {
		if (player.currentTime <= 2) {
			let playbackCursorIndex = $playbackCursor[0]
			let previousPlaybackCursorIndex = playbackCursorIndex - 1

			let previousSong = $playbackStore[previousPlaybackCursorIndex]

			if (previousSong) {
				$playbackCursor = [previousPlaybackCursorIndex, true]
			}
		} else {
			player.currentTime = 0
		}
	}
</script>

<svg
	class="player-button"
	on:click={() => previousButtonEvent()}
	version="1.1"
	id="Layer_1"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	x="0px"
	y="0px"
	viewBox="0 0 100 100"
	xml:space="preserve"
>
	<polygon points="13,48.5 100,92 100,5 " />
	<rect x="0" y="4.75" transform="matrix(-1 -1.224647e-16 1.224647e-16 -1 10 96.5001)" width="10" height="87" />
</svg>
