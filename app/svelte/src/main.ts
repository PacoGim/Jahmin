// import { get } from 'svelte/store'
import App from './App.svelte'
import { configStore } from './stores/config.store'
import { os, langFile } from './stores/main.store'
// import { currentEqHash } from './stores/equalizer.store'

async function loadApp() {
	configStore.set(await window.ipc.getConfig())
	os.set(await window.ipc.getOs())
	langFile.set(await window.ipc.getLangFile())

	// currentEqHash.set(get(config).userOptions.equalizerHash)

	return new App({
		target: document.body
	})
}

export default loadApp()
