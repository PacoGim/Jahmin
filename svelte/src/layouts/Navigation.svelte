<script lang="ts">
	import CogIcon from '../icons/CogIcon.svelte'

	import HomeIcon from '../icons/HomeIcon.svelte'
	import PlaybackIcon from '../icons/PlaybackIcon.svelte'
	import PlayListIcon from '../icons/PlayListIcon.svelte'
	import SearchIcon from '../icons/SearchIcon.svelte'

	import { layoutToShow } from '../store/final.store'
</script>

<navigation-svlt class="dark-theme">
	<nav-button on:click={() => ($layoutToShow = 'Library')}>
		<PlayListIcon
			style="{$layoutToShow === 'Library'
				? `fill:hsl(var(--art-hue), var(--art-saturation), 80%);`
				: 'fill:hsl(var(--art-hue), var(--art-saturation), 10%);'};height: 48px;width: 48px;padding: .5rem;"
		/>
	</nav-button>
	<nav-button on:click={() => ($layoutToShow = 'Playback')}>
		<PlaybackIcon
			style="{$layoutToShow === 'Playback'
				? `fill:hsl(var(--art-hue), var(--art-saturation), 80%);`
				: 'fill:hsl(var(--art-hue), var(--art-saturation), 10%);'};height: 48px;width: 48px;padding: .5rem;"
		/>
	</nav-button>
	<separator />
	<nav-button class="configButton" on:click={() => ($layoutToShow = 'Config')}>
		<CogIcon
			style="{$layoutToShow === 'Config'
				? `fill:hsl(var(--art-hue), var(--art-saturation), 80%);`
				: 'fill:hsl(var(--art-hue), var(--art-saturation), 10%);'};height: 48px;width: 48px;padding: .5rem;"
		/>
	</nav-button>
</navigation-svlt>

<style>
	navigation-svlt {
		grid-area: navigation-svlt;

		display: grid;
		grid-template-rows: repeat(2, max-content) auto max-content;

		background-color: rgba(var(--rgb-global), 0.025);
		border-right: 2px rgba(var(--rgb-global), 0.05) solid;

		transition-property: background-color, border-right;
		transition-duration: var(--theme-transition-duration);
		transition-timing-function: linear;
	}

	nav-button {
		display: flex;
		align-items: center;
		justify-content: center;

		border-radius: 3px;

		cursor: pointer;
		margin: 0.5rem;
		margin-bottom: 0.25rem;

		background-color: hsl(var(--art-hue), var(--art-saturation), 50%);

		transition-property: background-color;
		transition-duration: var(--theme-transition-duration);
		transition-timing-function: linear;
	}

	nav-button.configButton {
		margin-bottom: 0.5rem;
		/* margin: none; */
	}
</style>
