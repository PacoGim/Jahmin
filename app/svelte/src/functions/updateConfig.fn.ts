import deepmerge from 'deepmerge'
import type { ConfigType, PartialConfigType } from '../../../types/config.type'
import { config } from '../stores/main.store'

export default function (newConfig: PartialConfigType<ConfigType>) {
	let mergedConfig

	config.subscribe(value => (mergedConfig = deepmerge(value, newConfig)))()

	window.ipc.saveConfig(newConfig)

	config.set(mergedConfig)
}
