<script lang="ts">
	import ConfigController from './controllers/ConfigController.svelte'
	import PlayerController from './controllers/PlayerController.svelte'

	import { onMount } from 'svelte'
	import { syncDbVersionIPC } from './service/ipc.service'
	import { appTitle, keypress } from './store/final.store'
	import { handleContextMenuEvent } from './service/contextMenu.service'
	import IpcController from './controllers/IpcController.svelte'

	import MainLayout from './layout/main-layout/MainLayout.svelte'
	import ConfigLayout from './layout/config-layout/ConfigLayout.svelte'
	import SearchLayout from './layout/search-layout/SearchLayout.svelte'
	import EqualizerController from './controllers/EqualizerController.svelte'
	import { nextSong } from './functions/nextSong.fn'
	import previousSongFn from './functions/previousSong.fn'
	import { runThemeHandler } from './service/themeHandler.service'

	import iziToast from 'izitoast'

	import EqualizerService from './svelte-service/EqualizerService.svelte'
	import { confirmService, equalizerService, promptService } from './store/service.store'
	import Prompt from './components/Prompt.svelte'
	import Confirm from './components/Confirm.svelte'

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

		navigator.mediaSession.setActionHandler('previoustrack', function () {
			previousSongFn()
		})

		navigator.mediaSession.setActionHandler('nexttrack', function () {
			// User hit "Previous Track" key.
			nextSong()
		})

		let audio = document.querySelector('audio')

		navigator.mediaSession.setActionHandler('seekbackward', evt => {
			// User clicked "Seek Backward" media notification icon.
			audio.currentTime = Math.max(audio.currentTime, 0)
		})

		navigator.mediaSession.setActionHandler('seekforward', evt => {
			// User clicked "Seek Forward" media notification icon.
			audio.currentTime = Math.min(audio.currentTime, audio.duration)
		})
	})
</script>

<svelte:head>
	<title>{$appTitle}</title>
</svelte:head>

<PlayerController />
<ConfigController />
<IpcController />
<EqualizerController />

<MainLayout />
<ConfigLayout />
<SearchLayout />

<EqualizerService bind:this={$equalizerService} />
<Prompt bind:this={$promptService} />
<Confirm bind:this={$confirmService} />