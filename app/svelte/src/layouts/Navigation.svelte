<script lang="ts">
	import CogIcon from '../icons/CogIcon.svelte'

	import PlaybackIcon from '../icons/PlaybackIcon.svelte'
	import PlayListIcon from '../icons/PlayListIcon.svelte'
	import SpeakIcon from '../icons/SpeakIcon.svelte'

	import { layoutToShow } from '../stores/main.store'
</script>

<navigation-svlt>
	<nav-button
		on:click={() => ($layoutToShow = 'Library')}
		on:keypress={() => ($layoutToShow = 'Library')}
		tabindex="-1"
		role="button"
	>
		<PlayListIcon
			style="{$layoutToShow === 'Library'
				? `fill:hsl(var(--art-hue), var(--art-saturation), 80%);`
				: 'fill:hsl(var(--art-hue), var(--art-saturation), 10%);'};height: var(--icon-size);width: var(--icon-size);padding: .5rem;"
		/>
	</nav-button>
	<nav-button
		on:click={() => ($layoutToShow = 'Playback')}
		on:keypress={() => ($layoutToShow = 'Playback')}
		tabindex="-1"
		role="button"
	>
		<PlaybackIcon
			style="{$layoutToShow === 'Playback'
				? `fill:hsl(var(--art-hue), var(--art-saturation), 80%);`
				: 'fill:hsl(var(--art-hue), var(--art-saturation), 10%);'};height: var(--icon-size);width: var(--icon-size);padding: .5rem;"
		/>
	</nav-button>
	<nav-button
		on:click={() => ($layoutToShow = 'Lyrics')}
		on:keypress={() => ($layoutToShow = 'Lyrics')}
		tabindex="-1"
		role="button"
	>
		<SpeakIcon
			style="{$layoutToShow === 'Lyrics'
				? `fill:hsl(var(--art-hue), var(--art-saturation), 80%);`
				: 'fill:hsl(var(--art-hue), var(--art-saturation), 10%);'};height: var(--icon-size);width: var(--icon-size);padding: .5rem;"
		/>
	</nav-button>
	<nav-button
		on:click={() => ($layoutToShow = 'Playlist')}
		on:keypress={() => ($layoutToShow = 'Playlist')}
		tabindex="-1"
		role="button"
	>
		<SpeakIcon
			style="{$layoutToShow === 'Playlist'
				? `fill:hsl(var(--art-hue), var(--art-saturation), 80%);`
				: 'fill:hsl(var(--art-hue), var(--art-saturation), 10%);'};height: var(--icon-size);width: var(--icon-size);padding: .5rem;"
		/>
	</nav-button>
	<separator />
	<nav-button
		class="configButton"
		on:click={() => ($layoutToShow = 'Config')}
		on:keypress={() => ($layoutToShow = 'Config')}
		tabindex="-1"
		role="button"
	>
		<CogIcon
			style="{$layoutToShow === 'Config'
				? `fill:hsl(var(--art-hue), var(--art-saturation), 80%);`
				: 'fill:hsl(var(--art-hue), var(--art-saturation), 10%);'};height: var(--icon-size);width: var(--icon-size);padding: .5rem;"
		/>
	</nav-button>
</navigation-svlt>

<style>
	navigation-svlt {
		grid-area: navigation-svlt;

		display: grid;
		grid-template-rows: repeat(4, max-content) auto max-content;

		border-right: 2px solid rgba(255, 255, 255, 0.05);

		width: max-content;
	}

	nav-button {
		display: flex;
		align-items: center;
		justify-content: center;

		width: max-content;

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
