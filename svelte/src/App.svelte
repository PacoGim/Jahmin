<script lang="ts">
	import { onMount } from 'svelte'
	import {
		appTitle,
		isAppIdle,
		keyDown,
		keyUp,
		layoutToShow,
		currentAudioElement,
		dbVersionStore,
		dbSongsStore,
		selectedSongsStore,
		selectedAlbumDir,
		songListStore
	} from './store/final.store'

	import ConfigLayout from './layouts/config/ConfigLayout.svelte'
	import SearchLayout from './layouts/search/SearchLayout.svelte'

	import previousSongFn from './functions/previousSong.fn'

	import { runThemeHandler } from './services/themeHandler.service'
	import { handleContextMenuEvent } from './services/contextMenu.service'

	import iziToast from 'izitoast'

	import { confirmService, equalizerService, promptService, rangeInputService, storageService } from './store/service.store'

	import PlayerMiddleware from './middleware/PlayerMiddleware.svelte'
	import ConfigMiddleware from './middleware/ConfigMiddleware.svelte'
	import IpcMiddleware from './middleware/IpcMiddleware.svelte'
	import EqualizerMiddleware from './middleware/EqualizerMiddleware.svelte'

	import EqualizerService from './svelte-services/EqualizerService.svelte'
	import PromptService from './svelte-services/PromptService.svelte'
	import ConfirmService from './svelte-services/ConfirmService.svelte'
	import RangeInputService from './svelte-services/RangeInputService.svelte'

	import StatusBar from './layouts/StatusBar.svelte'
	import Navigation from './layouts/Navigation.svelte'
	import ControlBar from './layouts/ControlBar.svelte'
	import HomeLayout from './layouts/main/HomeLayout.svelte'

	import 'tippy.js/dist/tippy.css'
	import 'tippy.js/dist/svg-arrow.css'
	import 'tippy.js/animations/scale-subtle.css'
	import AudioPlayer from './layouts/AudioPlayer.svelte'
	import EventsHandlerMiddleware from './middleware/EventsHandlerMiddleware.svelte'
	import nextSongFn from './functions/nextSong.fn'
	import StorageService from './svelte-services/StorageService.svelte'
	import { runSongFetchIPC, sendAppReadyIPC } from './services/ipc.service'
	import { addTaskToQueue, db, getAlbumSongs, getAllSongs } from './db/db'
	import { liveQuery } from 'dexie'
	import sortSongsArrayFn from './functions/sortSongsArray.fn'
	import { sortByConfig, sortOrderConfig } from './store/config.store'

	let appIdleDebounce = getAppIdleDebounce()

	// Listens to live changes from the db and updates the svelte store.
	liveQuery(async () => {
		return await db.songs.toArray()
	}).subscribe(songs => {
		$dbSongsStore = songs
		updateSongList()
	})

	function updateSongList() {
		getAlbumSongs($selectedAlbumDir).then(songs => {
			$songListStore = sortSongsArrayFn(songs, $sortByConfig, $sortOrderConfig)
		})
	}

	onMount(() => {
		iziToast.settings({ position: 'topRight' })

		runThemeHandler()

		sendAppReadyIPC()

		// To prevent slow transition of colors when app loads, the transition duration is set to 0ms by default then set to 500ms after 2000ms (Far after app is done loading).
		setTimeout(() => {
			document.documentElement.style.setProperty('--theme-transition-duration', '500ms')
		}, 2000)

		window.addEventListener('keyup', evt => {
			$keyUp = evt.key

			// Resets the keypress value
			setTimeout(() => {
				$keyUp = undefined
				$keyDown = undefined
			}, 1)
		})

		window.addEventListener('mouseover', () => {
			$isAppIdle = false

			clearTimeout(appIdleDebounce)

			appIdleDebounce = getAppIdleDebounce()
		})

		window.addEventListener('keydown', evt => {
			$keyDown = evt.key
		})

		// Prevents scroll with spacebar.
		window.onkeydown = function (e) {
			return !(e.code === 'Space' && e.target === document.body)
		}

		window.addEventListener('contextmenu', (e: MouseEvent) => handleContextMenuEvent(e))

		navigator.mediaSession.setActionHandler('play', () => {
			$currentAudioElement.play()
		})

		navigator.mediaSession.setActionHandler('pause', () => {
			$currentAudioElement.pause()
		})

		navigator.mediaSession.setActionHandler('previoustrack', function () {
			previousSongFn()
		})

		navigator.mediaSession.setActionHandler('nexttrack', function () {
			// User hit "Previous Track" key.
			nextSongFn()
		})
	})

	function getAppIdleDebounce() {
		return setTimeout(() => {
			$isAppIdle = true
		}, 60000)
	}
</script>

<svelte:head>
	<title>{$appTitle}</title>
</svelte:head>

<ConfigMiddleware />
<PlayerMiddleware />
<IpcMiddleware />
<EqualizerMiddleware />
<EventsHandlerMiddleware />

<AudioPlayer />

<main-app>
	<Navigation />
	<ControlBar />
	<StatusBar />
	<current-window-svlt>
		{#if $layoutToShow === 'Home'}
			<HomeLayout />
		{:else if $layoutToShow === 'Config'}
			<ConfigLayout />
		{:else if $layoutToShow === 'Search'}
			<SearchLayout />
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
