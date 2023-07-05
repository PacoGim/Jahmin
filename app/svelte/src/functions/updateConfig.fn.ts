import { get } from 'svelte/store'
import type { ConfigType, PartialConfigType } from '../../../types/config.type'
import { config } from '../stores/config.store'

export default function (newConfig: PartialConfigType, { doUpdateLocalConfig } = { doUpdateLocalConfig: true }) {
	return new Promise((resolve, reject) => {
		if (doUpdateLocalConfig === true) {
			let mergedConfig

			mergedConfig = mergeConfig(get(config), newConfig)

			config.set(mergedConfig)
		}

		window.ipc.saveConfig(newConfig).then(() => {
			resolve('ok')
		})
	})
}

function mergeConfig(existingConfig: ConfigType, newConfig: PartialConfigType): any {
	const result = { ...existingConfig }
	for (const key in newConfig) {
		if (typeof newConfig[key] === 'object' && !Array.isArray(newConfig[key])) {
			result[key] = mergeConfig(result[key], newConfig[key])
		} else {
			result[key] = newConfig[key]
		}
	}
	return result
}
