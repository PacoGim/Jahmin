<script lang="ts">
	import { onMount } from 'svelte'
	import { appTitle, isAppIdle, keyDown, keyUp, layoutToShow, currentAudioElement } from './store/final.store'

	import ConfigLayout from './layouts/config/ConfigLayout.svelte'
	import SearchLayout from './layouts/search/SearchLayout.svelte'

	import { nextSong } from './functions/nextSong.fn'
	import previousSongFn from './functions/previousSong.fn'

	import { runThemeHandler } from './services/themeHandler.service'
	import { syncDbVersionIPC } from './services/ipc.service'
	import { handleContextMenuEvent } from './services/contextMenu.service'

	import iziToast from 'izitoast'

	import { confirmService, equalizerService, promptService, rangeInputService } from './store/service.store'

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
	import Player from './layouts/Player.svelte'
	import HomeLayout from './layouts/main/HomeLayout.svelte'

	import 'tippy.js/dist/tippy.css'
	import 'tippy.js/dist/svg-arrow.css';
	import 'tippy.js/animations/scale-subtle.css';

	let appIdleDebounce = getAppIdleDebounce()

	onMount(() => {
		iziToast.settings({ position: 'topRight' })

		runThemeHandler()

		syncDbVersionIPC()

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
			nextSong()
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

<main-app>
	<Navigation />
	<Player />
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

<style>
	main-app {
		display: grid;

		height: 100vh;

		grid-template-columns: 64px auto;
		grid-template-rows: auto 64px 32px;

		grid-template-areas:
			'navigation-svlt current-window-svlt'
			'navigation-svlt player-svlt'
			'statusbar-svlt statusbar-svlt';
	}

	main-app > current-window-svlt {
		grid-area: current-window-svlt;
		height: calc(100vh - 64px - 32px);
	}
</style>
