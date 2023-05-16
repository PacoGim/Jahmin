import deepmerge from 'deepmerge'
import { get } from 'svelte/store'
import type { ConfigType, PartialConfigType } from '../../../types/config.type'
import { config } from '../stores/config.store'

export default function (newConfig: PartialConfigType | any, { doUpdateLocalConfig } = { doUpdateLocalConfig: true }) {
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
