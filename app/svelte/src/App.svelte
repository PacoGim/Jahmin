<script lang="ts">
	import { onMount } from 'svelte'
	import { liveQuery } from 'dexie'

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
	import EqualizerMiddleware from './middlewares/EqualizerMiddleware.svelte'

	import AudioPlayer from './layouts/AudioPlayer.svelte'
	import Navigation from './layouts/Navigation.svelte'
	import ControlBar from './layouts/ControlBar.svelte'
	import StatusBar from './layouts/status_bar/!StatusBar.svelte'
	import LibraryLayout from './layouts/library/!LibraryLayout.svelte'
	import ConfigLayout from './layouts/config/ConfigLayout.svelte'
	import EventsHandlerMiddleware from './middlewares/EventsHandlerMiddleware.svelte'

	import { getDB } from './db/!dbObject'

	import { dbSongsStore, appTitle, layoutToShow, reloadArts } from './stores/main.store'
	import PlaybackLayout from './layouts/playback/PlaybackLayout.svelte'
	import { equalizerService, confirmService, promptService, rangeInputService, storageService } from './stores/service.store'
	import EqualizerService from './svelte_services/EqualizerService.svelte'
	import PromptService from './svelte_services/PromptService.svelte'
	import ConfirmService from './svelte_services/ConfirmService.svelte'
	import RangeInputService from './svelte_services/RangeInputService.svelte'
	import StorageService from './svelte_services/StorageService.svelte'
	import cssVariablesService from './services/cssVariables.service'

	liveQuery(async () => {
		return await getDB().songs.toArray()
	}).subscribe(songs => {
		$dbSongsStore = songs
	})

	onMount(() => {
		onAppMountedService()
	})
</script>

<svelte:head>
	<title>{$appTitle}</title>
</svelte:head>

<IpcMiddleware />
<PlayerMiddleware />
<EqualizerMiddleware />
<EventsHandlerMiddleware />

<AudioPlayer />

<main-app>
	<Navigation />
	<ControlBar />
	<StatusBar />

	<current-window-svlt>
		{#if $layoutToShow === 'Library'}
			<LibraryLayout />
		{:else if $layoutToShow === 'Config'}
			<ConfigLayout />
		{:else if $layoutToShow === 'Playback'}
			<PlaybackLayout />
		{/if}
	</current-window-svlt>
</main-app>

<EqualizerService bind:this={$equalizerService} />
<PromptService bind:this={$promptService} />
<ConfirmService bind:this={$confirmService} />
<RangeInputService bind:this={$rangeInputService} />
<StorageService bind:this={$storageService} />

<style>
	main-app {
		display: grid;

		height: 100vh;

		grid-template-columns: 64px auto;
		grid-template-rows: auto 64px 32px;

		grid-template-areas:
			'navigation-svlt current-window-svlt'
			'navigation-svlt control-bar-svlt'
			'statusbar-svlt statusbar-svlt';
	}

	main-app > current-window-svlt {
		grid-area: current-window-svlt;
		height: calc(100vh - 64px - 32px);
	}
</style>
