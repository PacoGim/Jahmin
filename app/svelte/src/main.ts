import App from './App.svelte'
import { config } from './stores/main.store'

async function loadApp() {
	config.set(await window.ipc.getConfig())


	return new App({
		target: document.body
	})
}

export default loadApp()
