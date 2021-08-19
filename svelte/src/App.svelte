<script lang="ts">
	import ConfigController from './controllers/ConfigController.svelte'
	import PlayerController from './controllers/PlayerController.svelte'

	import { onMount } from 'svelte'
	import { syncDbVersionIPC } from './service/ipc.service'
	import { appTitle, showConfigLayout } from './store/final.store'
	import { handleContextMenuEvent } from './service/contextMenu.service'
	import IpcController from './controllers/IpcController.svelte'

	import MainLayout from './layout/main-layout/MainLayout.svelte'
	import ConfigLayout from './layout/config-layout/ConfigLayout.svelte'

	onMount(() => {
		syncDbVersionIPC()

		window.onkeydown = function (e) {
			return !(e.code == 'Space' && e.target == document.body)
		}

		window.addEventListener('contextmenu', (e: MouseEvent) => handleContextMenuEvent(e))
	})
</script>

<svelte:head>
	<title>{$appTitle}</title>
</svelte:head>

<PlayerController />
<ConfigController />
<IpcController />

<MainLayout />
<ConfigLayout />

<style>
</style>
