import deepmerge from 'deepmerge'
import { get } from 'svelte/store'
import type { ConfigType, PartialConfigType } from '../../../types/config.type'
import { config } from '../stores/config.store'

export default function (newConfig: PartialConfigType<ConfigType>) {
	let mergedConfig

	mergedConfig = deepmerge(get(config), newConfig)

	window.ipc.saveConfig(newConfig)

	config.set(mergedConfig)
}
