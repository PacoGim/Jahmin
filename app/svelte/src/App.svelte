<script lang="ts">
	import { afterUpdate, onMount } from 'svelte'

	/********************** Services **********************/
	import onAppMountedService from './services/onAppMounted.service'

	/********************** Functions **********************/

	/********************** Tippy **********************/
	import 'tippy.js/dist/tippy.css'
	import 'tippy.js/dist/svg-arrow.css'
	import 'tippy.js/animations/scale-subtle.css'

	/********************** Middlewares **********************/
	import IpcMiddleware from './middlewares/IpcMiddleware.svelte'
	import PlayerMiddleware from './middlewares/PlayerMiddleware.svelte'

	import AudioPlayer from './layouts/AudioPlayer.svelte'
	import Navigation from './layouts/Navigation.svelte'
	import ControlBar from './layouts/ControlBar.svelte'
	import StatusBar from './layouts/status_bar/!StatusBar.svelte'
	import LibraryLayout from './layouts/library/!LibraryLayout.svelte'
	import ConfigLayout from './layouts/config/ConfigLayout.svelte'
	import EventsHandlerMiddleware from './middlewares/EventsHandlerMiddleware.svelte'

	import { layoutToShow } from './stores/main.store'
	import PlaybackLayout from './layouts/playback/PlaybackLayout.svelte'
	import {
		confirmService,
		downloadFfmpegService,
		promptService,
		rangeInputService,
		storageService
	} from './stores/service.store'
	import PromptService from './svelte_services/PromptService.svelte'
	import ConfirmService from './svelte_services/ConfirmService.svelte'
	import RangeInputService from './svelte_services/RangeInputService.svelte'
	import StorageService from './svelte_services/StorageService.svelte'
	import LyricsLayout from './layouts/lyrics/!LyricsLayout.svelte'
	import DownloadFfmpegService from './svelte_services/DownloadFfmpegService.svelte'

	onMount(() => {
		onAppMountedService()
	})
</script>

<IpcMiddleware />
<PlayerMiddleware />
<EventsHandlerMiddleware />

<AudioPlayer />

<main-app>
	<Navigation />
	<ControlBar />
	<StatusBar />

	<current-window-svlt class={$layoutToShow}>
		{#if $layoutToShow === 'Library'}
			<LibraryLayout />
		{:else if $layoutToShow === 'Config'}
			<ConfigLayout />
		{:else if $layoutToShow === 'Playback'}
			<PlaybackLayout />
		{:else if $layoutToShow === 'Lyrics'}
			<LyricsLayout />
		{/if}
	</current-window-svlt>
</main-app>

<PromptService bind:this={$promptService} />
<ConfirmService bind:this={$confirmService} />
<RangeInputService bind:this={$rangeInputService} />
<StorageService bind:this={$storageService} />
<DownloadFfmpegService bind:this={$downloadFfmpegService} />

<style>
	search-container {
		position: fixed;
		top: 0;
		right: 0;
	}

	main-app {
		display: grid;

		height: 100vh;

		grid-template-columns: min-content auto;
		grid-template-rows: auto 64px 32px;

		grid-template-areas:
			'navigation-svlt current-window-svlt'
			'navigation-svlt control-bar-svlt'
			'statusbar-svlt statusbar-svlt';
	}

	main-app > current-window-svlt {
		grid-area: current-window-svlt;
		height: calc(100vh - 64px - 32px);
		overflow-y: auto;
		overflow-x: hidden;
	}

	current-window-svlt.Playback {
		overflow-y: hidden;
	}
</style>
