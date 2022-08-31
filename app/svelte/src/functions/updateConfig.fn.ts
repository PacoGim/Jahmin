import deepmerge from 'deepmerge'
import { config } from '../stores/main.store'

export default function (newConfig: any) {
	let mergedConfig

	config.subscribe(value => (mergedConfig = deepmerge(value, newConfig)))()

	window.ipc.saveConfig(newConfig)

	config.set(mergedConfig)
}
