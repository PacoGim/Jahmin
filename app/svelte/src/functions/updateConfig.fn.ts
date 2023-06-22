import deepmerge from 'deepmerge'
import { get } from 'svelte/store'
import type { ConfigType } from '../../../types/config.type'
import { config } from '../stores/config.store'

export default function (newConfig: ConfigType | any, { doUpdateLocalConfig } = { doUpdateLocalConfig: true }) {
	return new Promise((resolve, reject) => {
		if (doUpdateLocalConfig === true) {
			let mergedConfig

			mergedConfig = deepmerge(get(config), newConfig)

			config.set(mergedConfig)
		}

		window.ipc.saveConfig(newConfig).then(() => {
			resolve('ok')
		})
	})
}
