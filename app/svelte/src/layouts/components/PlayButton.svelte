<script lang="ts">
	import { isPlaying } from '../../stores/main.store'

	import togglePlayPauseFn from '../../functions/togglePlayPause'

	export let customSize = 'var(--button-size)'
	export let customColor = 'var(--art-color-dark)'
	export let customMargins = '0'
</script>

<play-pause-button
	style="height: {customSize}; width: {customSize};margin:{customMargins};"
	class={$isPlaying ? '' : 'playing'}
	on:click={() => togglePlayPauseFn()}
	on:keypress={() => togglePlayPauseFn()}
	tabindex="-1"
	role="button"
>
	<left-part style="background-color:{customColor};" />

	<right-part style="background-color:{customColor};" />
</play-pause-button>

<style>
	play-pause-button {
		position: relative;
		display: block;
		/* height: var(--button-size); */
		/* width: var(--button-size); */
		background-color: transparent;
	}

	play-pause-button > * {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		/* background-color: var(--art-color-dark); */
		width: 100%;
		height: 100%;
		transition: background-color 300ms ease-in-out, clip-path 500ms cubic-bezier(0.075, 0.82, 0.165, 1);
	}

	play-pause-button.playing left-part {
		clip-path: polygon(0 0, 50.5% 25.25%, 50.5% 74.75%, 0% 100%);
	}

	play-pause-button.playing right-part {
		clip-path: polygon(49.5% 24.75%, 100% 50%, 100% 50%, 49.5% 75.25%);
	}

	left-part {
		clip-path: polygon(0 0, 33% 0, 33% 100%, 0% 100%);
	}

	right-part {
		clip-path: polygon(66% 0, 100% 0, 100% 100%, 66% 100%);
	}
</style>
