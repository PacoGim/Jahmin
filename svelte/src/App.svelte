<script lang="ts">
	import { onMount } from 'svelte'
	import { appTitle, keypress, playerElement } from './store/final.store'

	import MainLayout from './layouts/main/MainLayout.svelte'
	import ConfigLayout from './layouts/config/ConfigLayout.svelte'
	import SearchLayout from './layouts/search/SearchLayout.svelte'

	import { nextSong } from './functions/nextSong.fn'
	import previousSongFn from './functions/previousSong.fn'

	import { runThemeHandler } from './services/themeHandler.service'
	import { syncDbVersionIPC } from './services/ipc.service'
	import { handleContextMenuEvent } from './services/contextMenu.service'

	import iziToast from 'izitoast'

	import { confirmService, equalizerService, promptService } from './store/service.store'

	import PlayerMiddleware from './middleware/PlayerMiddleware.svelte'
	import ConfigMiddleware from './middleware/ConfigMiddleware.svelte'
	import IpcMiddleware from './middleware/IpcMiddleware.svelte'
	import EqualizerMiddleware from './middleware/EqualizerMiddleware.svelte'

	import EqualizerService from './svelte-services/EqualizerService.svelte'
	import PromptService from './svelte-services/PromptService.svelte'
	import ConfirmService from './svelte-services/ConfirmService.svelte'

	onMount(() => {
		iziToast.settings({ position: 'topRight' })

		runThemeHandler()

		syncDbVersionIPC()

		// To prevent slow transition of colors when app loads, the transition duration is set to 0ms by default then set to 500ms after 2000ms (Far after app is done loading).
		setTimeout(() => {
			document.documentElement.style.setProperty('--theme-transition-duration', '500ms')
		}, 2000)

		window.addEventListener('keyup', evt => {
			$keypress = evt.key

			// Resets the keypress value
			setTimeout(() => ($keypress = undefined), 1)
		})

		// Prevents scroll with spacebar.
		window.onkeydown = function (e) {
			return !(e.code === 'Space' && e.target === document.body)
		}

		window.addEventListener('contextmenu', (e: MouseEvent) => handleContextMenuEvent(e))

		navigator.mediaSession.setActionHandler('play', () => {
			$playerElement.play()
		})

		navigator.mediaSession.setActionHandler('pause', () => {
			$playerElement.pause()
		})

		navigator.mediaSession.setActionHandler('previoustrack', function () {
			previousSongFn()
		})

		navigator.mediaSession.setActionHandler('nexttrack', function () {
			// User hit "Previous Track" key.
			nextSong()
		})
	})
</script>

<svelte:head>
	<title>{$appTitle}</title>
</svelte:head>

<PlayerMiddleware />
<ConfigMiddleware />
<IpcMiddleware />
<EqualizerMiddleware />

<MainLayout />
<ConfigLayout />
<SearchLayout />

<EqualizerService bind:this={$equalizerService} />
<PromptService bind:this={$promptService} />
<ConfirmService bind:this={$confirmService} />
