<script lang="ts">
	import ConfigController from './controllers/ConfigController.svelte'
	import PlayerController from './controllers/PlayerController.svelte'

	import { onMount } from 'svelte'
	import { syncDbVersionIPC } from './service/ipc.service'
	import { appTitle, themeToEnable } from './store/final.store'
	import { handleContextMenuEvent } from './service/contextMenu.service'
	import IpcController from './controllers/IpcController.svelte'

	import MainLayout from './layout/main-layout/MainLayout.svelte'
	import ConfigLayout from './layout/config-layout/ConfigLayout.svelte'
	import SearchLayout from './layout/search-layout/SearchLayout.svelte'
	import generateId from './functions/generateId.fn'
	import EqualizerController from './controllers/EqualizerController.svelte'
	import { nextSong } from './functions/nextSong.fn'
	import previousSongFn from './functions/previousSong.fn'
	import Modal from './components/Modal.svelte'
	import themeHandlerFn from './functions/themeHandler.fn'

	$: {
		// Sets the proper theme with Dark as default
		document.body.setAttribute('theme', $themeToEnable || 'Dark')
	}

	onMount(() => {
		themeHandlerFn()

		syncDbVersionIPC()

		window.onkeydown = function (e) {
			return !(e.code == 'Space' && e.target == document.body)
		}

		window.addEventListener('contextmenu', (e: MouseEvent) => handleContextMenuEvent(e))

		navigator.mediaSession.setActionHandler('previoustrack', function () {
			previousSongFn()
		})

		navigator.mediaSession.setActionHandler('nexttrack', function () {
			nextSong()
			// console.log('Next Track')
			// User hit "Previous Track" key.
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

<!-- <Modal title="Rename Equalizer Preset">
	<input slot="body" type="text" placeholder="Equalizer new name" />
</Modal> -->

<PlayerController />
<ConfigController />
<IpcController />
<EqualizerController />

<MainLayout />
<ConfigLayout />
<SearchLayout />

<style>
</style>
