import App from './App.svelte'
import { config } from './stores/config.store'
import { os, langFile } from './stores/main.store'

async function loadApp() {
	config.set(await window.ipc.getConfig())
	os.set(await window.ipc.getOs())
	langFile.set(await window.ipc.getLangFile())

	return new App({
		target: document.body
	})
}

export default loadApp()
