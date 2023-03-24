import { get } from 'svelte/store'
import { config } from '../stores/config.store'
import { langFile } from '../stores/main.store'

export default function (stringToTraduce: string) {
	if (!stringToTraduce) return stringToTraduce

	let language = get(config)?.userOptions?.language

	if (language === 'english') return stringToTraduce

	let traduced = get(langFile)?.[stringToTraduce]

	if (!traduced) {
		console.log(`Missing "${stringToTraduce}" traduction in ${language}`)
	}

	return traduced || stringToTraduce
}
